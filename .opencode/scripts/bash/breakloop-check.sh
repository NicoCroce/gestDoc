#!/usr/bin/env bash
# breakloop-check.sh — Lee el campo `attempts` del frontmatter YAML de un
# artefacto de memory/{task_id}/ y decide si corresponde activar el Protocolo
# Break-Loop (attempts >= 3), replicado idéntico hoy en blendverse-tester.md,
# blendverse-qa.md y blendverse-reviewer.md. También puede escribir
# memory/BLOCKED.md con el schema de memory.instructions.md.
#
# Uso:
#   breakloop-check.sh check <archivo>
#     Lee el frontmatter YAML de <archivo> (ej. memory/{task_id}/02_dev_log.md),
#     extrae "attempts" (default 0 si no está presente) e imprime JSON:
#     {file, attempts, blocked: attempts >= 3}
#
#   breakloop-check.sh block <task_id> <agent> <reason>
#     Crea/sobreescribe memory/{task_id}/../BLOCKED.md (en memory/BLOCKED.md,
#     raíz de memory/, según memory.instructions.md) con el schema:
#     task_id, agent, blocked_at, attempts (leído del archivo relevante si se
#     puede inferir, si no 3 por default), reason.
#
# Requiere: jq (para el JSON de salida). El parseo de YAML es grep/sed simple
# (frontmatter plano, sin anidamiento — no hace falta yq).

set -uo pipefail

SCRIPT_DIR="$(CDPATH="" cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(CDPATH="" cd -- "$SCRIPT_DIR/../../.." && pwd)"

usage() {
    echo "Uso:" >&2
    echo "  $0 check <archivo>" >&2
    echo "  $0 block <task_id> <agent> <reason>" >&2
    exit 1
}

require_jq() {
    if ! command -v jq >/dev/null 2>&1; then
        echo "ERROR: jq no está disponible." >&2
        exit 1
    fi
}

# extract_frontmatter_field <archivo> <campo> -> valor o "" si no existe
extract_frontmatter_field() {
    local file="$1" field="$2"
    [[ -f "$file" ]] || { echo ""; return 0; }
    # Extraer solo el bloque entre el primer y segundo "---", buscar la línea
    # "campo: valor" (tolera comillas simples/dobles y comentarios "# ...").
    awk '/^---$/{c++; next} c==1' "$file" \
        | grep -E "^${field}:" \
        | head -n1 \
        | sed -E "s/^${field}:[[:space:]]*//; s/[[:space:]]*#.*$//; s/^['\"]//; s/['\"]$//"
}

cmd_check() {
    local file="${1:-}"
    [[ -n "$file" ]] || usage
    require_jq

    if [[ ! -f "$file" ]]; then
        jq -n --arg file "$file" '{file: $file, attempts: 0, blocked: false, error: "archivo no existe"}'
        return 0
    fi

    local attempts
    attempts="$(extract_frontmatter_field "$file" "attempts")"
    [[ "$attempts" =~ ^[0-9]+$ ]] || attempts=0

    local blocked="false"
    [[ "$attempts" -ge 3 ]] && blocked="true"

    jq -n --arg file "$file" --argjson attempts "$attempts" --argjson blocked "$blocked" \
        '{file: $file, attempts: $attempts, blocked: $blocked}'
}

cmd_block() {
    local task_id="${1:-}" agent="${2:-}" reason="${3:-}"
    [[ -n "$task_id" && -n "$agent" && -n "$reason" ]] || usage

    local blocked_file="$REPO_ROOT/memory/BLOCKED.md"
    local blocked_at
    blocked_at="$(date -u +'%Y-%m-%d %H:%M')"

    # Intentar inferir attempts del artefacto más reciente del agente indicado.
    local attempts=3
    case "$agent" in
        Tester_Agent) attempts="$(extract_frontmatter_field "$REPO_ROOT/memory/$task_id/05_test_log.md" attempts)" ;;
        QA_Agent) attempts="$(extract_frontmatter_field "$REPO_ROOT/memory/$task_id/03_qa_report.md" attempts)" ;;
        Reviewer_Agent) attempts="$(extract_frontmatter_field "$REPO_ROOT/memory/$task_id/04_review_log.md" attempts)" ;;
    esac
    [[ "$attempts" =~ ^[0-9]+$ ]] || attempts=3

    cat > "$blocked_file" << EOF
---
task_id: '${task_id}'
agent: '${agent}'
blocked_at: '${blocked_at}'
attempts: ${attempts}
reason: '${reason}'
---

# Tarea bloqueada — intervención humana requerida

La tarea \`${task_id}\` alcanzó el límite de 3 iteraciones en \`${agent}\` sin resolución.

**Motivo:** ${reason}
EOF

    echo "BLOCKED.md creado: $blocked_file" >&2
    jq -n --arg file "$blocked_file" --arg task_id "$task_id" --arg agent "$agent" --argjson attempts "$attempts" \
        '{file: $file, task_id: $task_id, agent: $agent, attempts: $attempts}'
}

main() {
    local subcommand="${1:-}"
    shift || true
    case "$subcommand" in
        check) cmd_check "$@" ;;
        block) cmd_block "$@" ;;
        *) usage ;;
    esac
}

main "$@"
