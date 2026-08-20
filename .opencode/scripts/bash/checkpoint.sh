#!/usr/bin/env bash
# checkpoint.sh — Gestiona memory/{task_id}/.checkpoint.json: calcula el
# resume_point verificando en disco (Paso 1.5 de blendverse-implement.md) y
# escribe/actualiza el checkpoint (Paso 2.6).
#
# Uso:
#   checkpoint.sh get <task_id>
#     Imprime un JSON: {resume_point, scope, branch, feature, context_source,
#     last_completed_step, valid, reason}. "valid: false" + reason cuando no
#     hay checkpoint o el archivo que lo respalda no existe en disco (obsoleto).
#
#   checkpoint.sh set <task_id> <last_completed_step> [campo=valor ...]
#     Sobreescribe (no acumula versiones) memory/{task_id}/.checkpoint.json.
#     Campos soportados como pares campo=valor: scope, branch, feature,
#     context_source, pr_url.
#
# Requiere: jq.

set -euo pipefail

SCRIPT_DIR="$(CDPATH="" cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(CDPATH="" cd -- "$SCRIPT_DIR/../../.." && pwd)"

usage() {
    echo "Uso:" >&2
    echo "  $0 get <task_id>" >&2
    echo "  $0 set <task_id> <last_completed_step> [campo=valor ...]" >&2
    exit 1
}

require_jq() {
    if ! command -v jq >/dev/null 2>&1; then
        echo "ERROR: jq no está disponible." >&2
        exit 1
    fi
}

checkpoint_path() {
    printf '%s/memory/%s/.checkpoint.json' "$REPO_ROOT" "$1"
}

task_dir() {
    printf '%s/memory/%s' "$REPO_ROOT" "$1"
}

json_result() {
    # json_result <resume_point> <valid> <reason> <checkpoint_json_or_null>
    local resume_point="$1" valid="$2" reason="$3" ckpt="$4"
    jq -n --arg rp "$resume_point" --argjson valid "$valid" --arg reason "$reason" --argjson ckpt "$ckpt" '
        {resume_point: $rp, valid: $valid, reason: $reason}
        + (if $ckpt == null then {} else {
            scope: $ckpt.scope,
            branch: $ckpt.branch,
            feature: $ckpt.feature,
            context_source: $ckpt.context_source,
            last_completed_step: $ckpt.last_completed_step,
            pr_url: ($ckpt.pr_url // null)
          } end)
    '
}

cmd_get() {
    local task_id="${1:-}"
    [[ -n "$task_id" ]] || usage
    require_jq

    local ckpt_file
    ckpt_file="$(checkpoint_path "$task_id")"
    local tdir
    tdir="$(task_dir "$task_id")"

    if [[ ! -f "$ckpt_file" ]]; then
        json_result "start" false "no existe .checkpoint.json — cadena completa desde el inicio" "null"
        return 0
    fi

    local ckpt
    ckpt="$(cat "$ckpt_file")"
    local last_step
    last_step="$(jq -r '.last_completed_step // empty' <<<"$ckpt")"
    local scope
    scope="$(jq -r '.scope // empty' <<<"$ckpt")"
    local completed_steps
    completed_steps="$(jq -c '.completed_steps // []' <<<"$ckpt")"

    # Verificación en disco + mapeo last_completed_step -> resume_point,
    # replicando exactamente la tabla del Paso 1.5 de blendverse-implement.md.
    # Si el artefacto esperado no existe, el resume_point retrocede al paso
    # anterior (o "start"), tal como indica la regla "gana el archivo".
    case "$last_step" in
        pr)
            if [[ -n "$(jq -r '.pr_url // empty' <<<"$ckpt")" ]]; then
                json_result "pr" true "" "$ckpt"
            else
                # pr_url ausente pese a last_completed_step=pr -> checkpoint inconsistente,
                # retroceder a "close" (falta abrir el PR).
                json_result "close" true "checkpoint marca pr pero falta pr_url — retrocede a close" "$ckpt"
            fi
            ;;
        close)
            json_result "pr" true "" "$ckpt"
            ;;
        reviewer)
            if [[ -f "$tdir/04_review_log.md" ]]; then
                json_result "close" true "" "$ckpt"
            else
                json_result "reviewer" true "falta 04_review_log.md en disco — retrocede a reviewer" "$ckpt"
            fi
            ;;
        qa)
            if [[ -f "$tdir/03_qa_report.md" ]]; then
                json_result "reviewer" true "" "$ckpt"
            else
                json_result "qa" true "falta 03_qa_report.md en disco — retrocede a qa" "$ckpt"
            fi
            ;;
        tester)
            if [[ -f "$tdir/05_test_log.md" ]]; then
                json_result "qa" true "" "$ckpt"
            else
                json_result "tester" true "falta 05_test_log.md en disco — retrocede a tester" "$ckpt"
            fi
            ;;
        back|front)
            if [[ ! -f "$tdir/02_dev_log.md" ]]; then
                json_result "start" true "falta 02_dev_log.md en disco — retrocede a start" "$ckpt"
                return 0
            fi
            if [[ "$scope" == "full-stack" ]]; then
                local has_back has_front
                has_back="$(jq -r 'index("back") != null' <<<"$completed_steps")"
                has_front="$(jq -r 'index("front") != null' <<<"$completed_steps")"
                if [[ "$has_back" == "true" && "$has_front" == "true" ]]; then
                    json_result "tester" true "" "$ckpt"
                elif [[ "$has_back" == "true" ]]; then
                    json_result "front" true "falta implementar frontend" "$ckpt"
                else
                    json_result "back" true "falta implementar backend" "$ckpt"
                fi
            else
                json_result "tester" true "" "$ckpt"
            fi
            ;;
        *)
            json_result "start" false "last_completed_step desconocido o vacío ('$last_step')" "$ckpt"
            ;;
    esac
}

cmd_set() {
    local task_id="${1:-}"
    local last_completed_step="${2:-}"
    [[ -n "$task_id" && -n "$last_completed_step" ]] || usage
    shift 2 || true
    require_jq

    local tdir
    tdir="$(task_dir "$task_id")"
    mkdir -p "$tdir"
    local ckpt_file
    ckpt_file="$(checkpoint_path "$task_id")"

    local existing="{}"
    [[ -f "$ckpt_file" ]] && existing="$(cat "$ckpt_file")"

    # Recalcular completed_steps: orden canónico de la cadena, se marca "completed"
    # cada paso hasta (e incluyendo) last_completed_step según su posición.
    local order='["back","front","tester","qa","reviewer","close","pr"]'
    local existing_completed
    existing_completed="$(jq -c '.completed_steps // []' <<<"$existing")"

    local updated
    updated="$(jq -n \
        --argjson existing "$existing" \
        --arg task_id "$task_id" \
        --arg last_step "$last_completed_step" \
        --argjson existing_completed "$existing_completed" \
        --arg timestamp "$(date -u +%Y-%m-%dT%H:%M:%SZ)" '
        ($existing_completed + [$last_step] | unique) as $completed
        | ($existing + {
            task_id: $task_id,
            last_completed_step: $last_step,
            completed_steps: $completed,
            timestamp: $timestamp
          })
    ')"

    # Aplicar overrides campo=valor pasados como argumentos adicionales.
    local field value
    for arg in "$@"; do
        field="${arg%%=*}"
        value="${arg#*=}"
        [[ "$arg" == *"="* ]] || continue
        updated="$(jq --arg v "$value" ".${field} = \$v" <<<"$updated")"
    done

    printf '%s\n' "$updated" | jq '.' > "$ckpt_file"
    echo "checkpoint actualizado: $ckpt_file" >&2
}

main() {
    local subcommand="${1:-}"
    shift || true
    case "$subcommand" in
        get) cmd_get "$@" ;;
        set) cmd_set "$@" ;;
        *) usage ;;
    esac
}

main "$@"
