#!/usr/bin/env bash
# resolve-task-id.sh — Resuelve/crea el task_id activo en memory/history_log.json
# sin que el agente orquestador (@blendverse-implement) tenga que razonar sobre
# JSON manualmente. Reemplaza el Paso 1 (puntos 2-3 y 9 parcial) descrito en
# .opencode/agents/blendverse-implement.md.
#
# Uso:
#   resolve-task-id.sh resolve <branch_raw> [title]
#     - Sanitiza la rama (reemplaza / por -).
#     - Si existe una entrada IN_PROGRESS para esa rama -> imprime su task_id (no escribe nada).
#     - Si no existe -> crea una entrada nueva (status IN_PROGRESS), aplica rotación de 10
#       entradas (elimina la COMPLETED más antigua si hace falta) e imprime el task_id nuevo.
#
#   resolve-task-id.sh close <task_id> <COMPLETED|BLOCKED> [pr_url]
#     - Cierra la entrada: status, closed_at, pr_url (opcional) y agents_chain armado
#       desde el frontmatter (agent, status, attempts) de los archivos de memory/{task_id}/.
#
# Requiere: jq.
#
# Salida: SOLO el task_id resuelto va a stdout. Cualquier diagnóstico va a stderr.

set -euo pipefail

SCRIPT_DIR="$(CDPATH="" cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(CDPATH="" cd -- "$SCRIPT_DIR/../../.." && pwd)"
HISTORY_LOG="$REPO_ROOT/memory/history_log.json"
MAX_ENTRIES=10

usage() {
    echo "Uso: $0 resolve <branch_raw> [title]" >&2
    echo "     $0 close <task_id> <COMPLETED|BLOCKED> [pr_url]" >&2
    exit 1
}

sanitize_branch() {
    printf '%s' "${1//\//-}"
}

require_jq() {
    if ! command -v jq >/dev/null 2>&1; then
        echo "ERROR: jq no está disponible. Este script requiere jq." >&2
        exit 1
    fi
}

ensure_history_log() {
    if [[ ! -f "$HISTORY_LOG" ]]; then
        mkdir -p "$(dirname "$HISTORY_LOG")"
        printf '{\n  "tasks": []\n}\n' > "$HISTORY_LOG"
    fi
}

cmd_resolve() {
    local branch_raw="${1:-}"
    local title="${2:-}"

    [[ -n "$branch_raw" ]] || usage
    require_jq
    ensure_history_log

    local branch
    branch="$(sanitize_branch "$branch_raw")"

    # 1. ¿Existe ya una entrada IN_PROGRESS para esta rama exacta?
    #    NOTA: no usar "contains" — genera falsos positivos cuando una rama es
    #    substring del task_id de otra rama distinta (ej. rama "x-2" calza dentro
    #    de "TASK-x-20260819-2"). Se ancla con capture() extrayendo el nombre de
    #    rama real embebido en el task_id (formato TASK-{branch}-{8 dígitos}-{N})
    #    y se compara por igualdad exacta contra $branch.
    local existing_id
    existing_id="$(jq -r --arg branch "$branch" '
        [.tasks[]
         | select(.status == "IN_PROGRESS")
         | select((.task_id | capture("^TASK-(?<b>.+)-[0-9]{8}-[0-9]+$").b) == $branch)
        ][0].task_id // empty
    ' "$HISTORY_LOG")"

    if [[ -n "$existing_id" ]]; then
        echo "$existing_id"
        return 0
    fi

    # 2. No hay tarea en curso para esta rama -> calcular el próximo N para hoy.
    local today
    today="$(date -u +%Y%m%d)"
    local prefix="TASK-${branch}-${today}-"

    local max_n
    max_n="$(jq -r --arg prefix "$prefix" '
        [.tasks[]
         | select(.task_id | startswith($prefix))
         | (.task_id | sub($prefix; "") | tonumber? // 0)
        ] | max // 0
    ' "$HISTORY_LOG")"

    local next_n=$((max_n + 1))
    local new_task_id="${prefix}${next_n}"
    local created_at
    created_at="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

    # 3. Insertar la entrada nueva y aplicar rotación (máx. MAX_ENTRIES). Se calcula
    #    el excedente exacto y se eliminan esas N entradas COMPLETED más antiguas
    #    (por created_at) de una sola vez — nunca se toca IN_PROGRESS/BLOCKED.
    local tmp
    tmp="$(mktemp)"
    jq --arg id "$new_task_id" \
       --arg created_at "$created_at" \
       --arg title "$title" \
       --argjson max_entries "$MAX_ENTRIES" '
        .tasks += [{
            task_id: $id,
            status: "IN_PROGRESS",
            created_at: $created_at
        } + (if $title != "" then {title: $title} else {} end)]
        | (.tasks | length - $max_entries) as $excess
        | if $excess > 0 then
            (.tasks | map(select(.status == "COMPLETED")) | sort_by(.created_at) | .[0:$excess] | map(.task_id)) as $to_remove
            | .tasks |= map(select((.task_id as $id | $to_remove | index($id)) == null))
          else . end
    ' "$HISTORY_LOG" > "$tmp"

    mv "$tmp" "$HISTORY_LOG"
    echo "$new_task_id"
}

frontmatter_field() {
    # frontmatter_field <file> <field> — valor sin comillas del frontmatter YAML plano.
    awk '/^---$/{c++; next} c==1' "$1" \
        | grep -E "^$2:" | head -n1 \
        | sed -E "s/^$2:[[:space:]]*//; s/[[:space:]]*#.*$//; s/^['\"]//; s/['\"]$//"
}

cmd_close() {
    local task_id="${1:-}" status="${2:-}" pr_url="${3:-}"
    [[ -n "$task_id" && ( "$status" == "COMPLETED" || "$status" == "BLOCKED" ) ]] || usage
    require_jq
    ensure_history_log

    jq -e --arg id "$task_id" '.tasks | any(.task_id == $id)' "$HISTORY_LOG" >/dev/null \
        || { echo "ERROR: $task_id no existe en history_log.json" >&2; exit 1; }

    local chain="[]" f agent st att
    for f in 01_requirements.md 02_dev_log.md 05_test_log.md 03_qa_report.md 04_review_log.md; do
        f="$REPO_ROOT/memory/$task_id/$f"
        [[ -f "$f" ]] || continue
        agent="$(frontmatter_field "$f" agent)"
        st="$(frontmatter_field "$f" status)"
        att="$(frontmatter_field "$f" attempts)"
        chain="$(jq --arg a "$agent" --arg s "$st" --arg n "${att:-1}" \
            '. + [{agent: $a, status: $s, attempts: ($n | tonumber? // 1)}]' <<<"$chain")"
    done

    local tmp
    tmp="$(mktemp)"
    jq --arg id "$task_id" --arg status "$status" --arg pr "$pr_url" \
       --arg closed_at "$(date -u +%Y-%m-%dT%H:%M:%SZ)" --argjson chain "$chain" '
        .tasks |= map(if .task_id == $id
            then . + {status: $status, closed_at: $closed_at, agents_chain: $chain}
                  + (if $pr != "" then {pr_url: $pr} else {} end)
            else . end)
    ' "$HISTORY_LOG" > "$tmp"
    mv "$tmp" "$HISTORY_LOG"
    echo "$task_id $status"
}

main() {
    local subcommand="${1:-}"
    shift || true
    case "$subcommand" in
        resolve) cmd_resolve "$@" ;;
        close) cmd_close "$@" ;;
        *) usage ;;
    esac
}

main "$@"
