#!/usr/bin/env bash
# qa-report.sh — Paso de QA completo de la cadena de implementación, sin LLM.
#
#   1. Break-loop: si 03_qa_report.md ya tiene attempts >= 3, no corre nada.
#   2. Lee affected_files del frontmatter de memory/{task_id}/02_dev_log.md.
#   3. Corre qa-check.sh <scope> <affected_files> y audit-arch.sh check.
#   4. Escribe memory/{task_id}/03_qa_report.md (frontmatter vía
#      memory-log-scaffold.sh + errores concretos solo si FAIL).
#
# Uso:
#   qa-report.sh <task_id> <scope>
#
# Salida (stdout): {status: PASS|FAIL|BLOCKED, attempts, report, feedback}
#   feedback: texto listo para pasar al coder en el retry (vacío si PASS).
#
# Requiere: jq.

set -uo pipefail

SCRIPT_DIR="$(CDPATH="" cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(CDPATH="" cd -- "$SCRIPT_DIR/../../.." && pwd)"

TASK_ID="${1:-}"
SCOPE="${2:-}"
[[ -n "$TASK_ID" && -n "$SCOPE" ]] || { echo "Uso: $0 <task_id> <scope>" >&2; exit 1; }

TASK_DIR="$REPO_ROOT/memory/$TASK_ID"
REPORT="$TASK_DIR/03_qa_report.md"
DEV_LOG="$TASK_DIR/02_dev_log.md"

blocked="$("$SCRIPT_DIR/breakloop-check.sh" check "$REPORT" | jq -r '.blocked')"
if [[ "$blocked" == "true" ]]; then
    "$SCRIPT_DIR/breakloop-check.sh" block "$TASK_ID" "QA_Agent" "QA falló 3 veces; ver memory/$TASK_ID/03_qa_report.md" >/dev/null
    jq -n --arg r "memory/$TASK_ID/03_qa_report.md" '{status: "BLOCKED", attempts: 3, report: $r, feedback: ""}'
    exit 0
fi

FILES=()
if [[ -f "$DEV_LOG" ]]; then
    while IFS= read -r line; do
        [[ -n "$line" ]] && FILES+=("$line")
    done < <(awk '/^---$/{c++; next} c==1' "$DEV_LOG" \
        | awk '/^affected_files:/{f=1; next} f && /^[[:space:]]*-/{print; next} f{exit}' \
        | sed -E "s/^[[:space:]]*-[[:space:]]*//; s/^['\"]//; s/['\"][[:space:]]*$//")
fi

qa_json="$("$SCRIPT_DIR/qa-check.sh" "$SCOPE" "${FILES[@]+"${FILES[@]}"}")"
if [[ ${#FILES[@]} -gt 0 ]]; then
    arch_json="$("$SCRIPT_DIR/audit-arch.sh" check "${FILES[@]}")"
else
    arch_json='{"results": [], "summary": {"ok": 0, "misplaced": 0, "unknown": 0}}'
fi

qa_status="$(jq -r '.status' <<<"$qa_json")"
misplaced="$(jq -r '.summary.misplaced' <<<"$arch_json")"
status="PASS"
[[ "$qa_status" != "PASS" || "$misplaced" != "0" ]] && status="FAIL"

feedback=""
if [[ "$status" == "FAIL" ]]; then
    feedback="$(jq -r '.steps | to_entries[] | select(.value.status != "PASS" and .value.status != "SKIPPED")
        | "### \(.key): \(.value.status)\n```\n\(.value.output_tail // "")\n```"' <<<"$qa_json")"
    arch_errors="$(jq -r '.results[] | select(.status == "MISPLACED") | "- `\(.file)`: esperado en `\(.expected)`"' <<<"$arch_json")"
    [[ -n "$arch_errors" ]] && feedback+=$'\n'"### Estructura: MISPLACED"$'\n'"$arch_errors"
fi

mkdir -p "$TASK_DIR"
# Se calcula antes de abrir el archivo: la redirección lo trunca y se perdería el attempts previo.
frontmatter="$("$SCRIPT_DIR/memory-log-scaffold.sh" frontmatter qa_report "$TASK_ID" QA_Agent "$status")"
{
    echo "$frontmatter"
    echo
    echo "# Reporte de QA"
    echo
    echo "- Scope: \`$SCOPE\` · archivos: ${#FILES[@]}"
    echo "- typescript: $(jq -r '.steps.typescript.status' <<<"$qa_json") · lint: $(jq -r '.steps.lint.status' <<<"$qa_json") · vitest: $(jq -r '.steps.vitest.status' <<<"$qa_json") · estructura: $([[ "$misplaced" == "0" ]] && echo OK || echo "$misplaced MISPLACED")"
    if [[ -n "$feedback" ]]; then
        echo
        echo "## Errores"
        echo
        echo "$feedback"
    fi
} > "$REPORT"

attempts="$("$SCRIPT_DIR/breakloop-check.sh" check "$REPORT" | jq -r '.attempts')"
jq -n --arg s "$status" --argjson a "${attempts:-1}" --arg r "memory/$TASK_ID/03_qa_report.md" --arg f "$feedback" \
    '{status: $s, attempts: $a, report: $r, feedback: $f}'
