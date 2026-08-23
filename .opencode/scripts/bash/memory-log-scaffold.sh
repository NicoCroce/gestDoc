#!/usr/bin/env bash
# memory-log-scaffold.sh — Arma el YAML frontmatter mecánico de los logs de
# memory/{task_id}/ (02_dev_log.md, 03_qa_report.md, 04_review_log.md,
# 05_test_log.md), calculando `attempts` correctamente (lee el archivo previo
# si existe e incrementa) y `date` (hoy). El agente solo escribe el CONTENIDO
# variable (el cuerpo del reporte, y para dev_log el campo `affected_files`)
# — nunca tiene que calcular a mano el incremento de attempts ni armar el
# YAML de memoria.instructions.md.
#
# Uso:
#   memory-log-scaffold.sh frontmatter <log_type> <task_id> <agent> <status>
#     log_type: dev_log | qa_report | review_log | test_log
#     agent:    Back_Agent | Front_Agent | QA_Agent | Reviewer_Agent | Tester_Agent
#     status:   valor válido según log_type (ver memory.instructions.md)
#
# Salida: el bloque YAML completo (--- ... ---) por stdout, listo para que el
# agente lo use como prefijo de su archivo. No escribe ningún archivo — el
# agente sigue siendo quien crea/edita memory/{task_id}/NN_archivo.md con el
# frontmatter + el contenido real.

set -uo pipefail

SCRIPT_DIR="$(CDPATH="" cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(CDPATH="" cd -- "$SCRIPT_DIR/../../.." && pwd)"

usage() {
    echo "Uso: $0 frontmatter <dev_log|qa_report|review_log|test_log> <task_id> <agent> <status>" >&2
    exit 1
}

filename_for() {
    case "$1" in
        dev_log) echo "02_dev_log.md" ;;
        qa_report) echo "03_qa_report.md" ;;
        review_log) echo "04_review_log.md" ;;
        test_log) echo "05_test_log.md" ;;
        *) echo "" ;;
    esac
}

valid_statuses_for() {
    case "$1" in
        dev_log) echo "IMPLEMENTED IN_PROGRESS" ;;
        qa_report|test_log) echo "PASS FAIL" ;;
        review_log) echo "APPROVED REJECTED" ;;
        *) echo "" ;;
    esac
}

extract_attempts() {
    local file="$1"
    [[ -f "$file" ]] || { echo "0"; return 0; }
    awk '/^---$/{c++; next} c==1' "$file" \
        | grep -E "^attempts:" \
        | head -n1 \
        | sed -E "s/^attempts:[[:space:]]*//; s/[[:space:]]*#.*$//"
}

cmd_frontmatter() {
    local log_type="${1:-}" task_id="${2:-}" agent="${3:-}" status="${4:-}"
    [[ -n "$log_type" && -n "$task_id" && -n "$agent" && -n "$status" ]] || usage

    local filename
    filename="$(filename_for "$log_type")"
    if [[ -z "$filename" ]]; then
        echo "ERROR: log_type inválido '$log_type' (esperado: dev_log|qa_report|review_log|test_log)" >&2
        exit 1
    fi

    local valid_statuses
    valid_statuses="$(valid_statuses_for "$log_type")"
    local status_ok=0
    for s in $valid_statuses; do
        [[ "$s" == "$status" ]] && status_ok=1
    done
    if [[ "$status_ok" -eq 0 ]]; then
        echo "ERROR: status '$status' inválido para $log_type (válidos: $valid_statuses)" >&2
        exit 1
    fi

    local file="$REPO_ROOT/memory/$task_id/$filename"
    local prev_attempts
    prev_attempts="$(extract_attempts "$file")"
    [[ "$prev_attempts" =~ ^[0-9]+$ ]] || prev_attempts=0

    local attempts
    if [[ -f "$file" ]]; then
        attempts=$((prev_attempts + 1))
    else
        attempts=1
    fi

    local today
    today="$(date -u +%Y-%m-%d)"

    cat << EOF
---
task_id: '${task_id}'
agent: '${agent}'
status: '${status}'
attempts: ${attempts}
date: '${today}'
---
EOF
}

main() {
    local subcommand="${1:-}"
    shift || true
    case "$subcommand" in
        frontmatter) cmd_frontmatter "$@" ;;
        *) usage ;;
    esac
}

main "$@"
