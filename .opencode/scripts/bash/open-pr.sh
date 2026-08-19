#!/usr/bin/env bash
# open-pr.sh — Consolida el flujo mecánico del Paso 5 de blendverse-implement.md:
# fetch + push + gh pr create (o fallback a URL de compare si gh no está
# disponible o falla) + limpieza del artefacto derivado pr-detail.md.
#
# NO genera el contenido del PR — eso lo hace el subagente `pr-detail` (skill
# `pr-detail`), que sí requiere razonamiento sobre el diff. Este script solo
# ejecuta la parte 100% mecánica una vez que el título y el body ya existen.
#
# Uso:
#   open-pr.sh <title> <body_file> [base_branch]
#     title: título del PR (string, ya generado por pr-detail.md → # PR: ...)
#     body_file: ruta al archivo pr-detail.md (se usa como --body-file y se
#       borra al final, sea cual sea el resultado)
#     base_branch: default "main"
#
# Salida: JSON {method: "gh"|"manual", pr_url: "..."|null, compare_url: "..."}
#
# Requiere: git. `gh` es opcional (fallback automático si falta o falla).

set -uo pipefail

SCRIPT_DIR="$(CDPATH="" cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(CDPATH="" cd -- "$SCRIPT_DIR/../../.." && pwd)"

usage() {
    echo "Uso: $0 <title> <body_file> [base_branch]" >&2
    exit 1
}

require_jq() {
    if ! command -v jq >/dev/null 2>&1; then
        echo "ERROR: jq no está disponible." >&2
        exit 1
    fi
}

TITLE="${1:-}"
BODY_FILE="${2:-}"
BASE_BRANCH="${3:-main}"
[[ -n "$TITLE" && -n "$BODY_FILE" ]] || usage
require_jq

cd "$REPO_ROOT"

CURRENT_BRANCH="$(git branch --show-current)"
if [[ -z "$CURRENT_BRANCH" ]]; then
    echo "ERROR: no se pudo determinar la rama actual (HEAD detached?)." >&2
    exit 1
fi

# --- owner/repo desde el remoto "origin", soportando SSH y HTTPS ---
remote_url="$(git remote get-url origin 2>/dev/null || true)"
owner_repo=""
if [[ "$remote_url" =~ github\.com[:/]([^/]+)/([^/.]+)(\.git)?$ ]]; then
    owner_repo="${BASH_REMATCH[1]}/${BASH_REMATCH[2]}"
fi

compare_url=""
if [[ -n "$owner_repo" ]]; then
    compare_url="https://github.com/${owner_repo}/compare/${BASE_BRANCH}...${CURRENT_BRANCH}?expand=1"
fi

# --- fetch + push (mecánico, sin generar contenido) ---
git fetch origin "$BASE_BRANCH" >&2
git push -u origin "$CURRENT_BRANCH" >&2

pr_url=""
method="manual"

if command -v gh >/dev/null 2>&1; then
    if pr_url="$(gh pr create --base "$BASE_BRANCH" --head "$CURRENT_BRANCH" --title "$TITLE" --body-file "$BODY_FILE" 2>&2)"; then
        method="gh"
    else
        pr_url=""
        method="manual"
    fi
fi

# Limpieza del artefacto derivado, pase lo que pase.
rm -f "$BODY_FILE"

if [[ "$method" == "gh" ]]; then
    jq -n --arg method "$method" --arg pr_url "$pr_url" --arg compare_url "$compare_url" \
        '{method: $method, pr_url: $pr_url, compare_url: $compare_url}'
else
    jq -n --arg method "$method" --arg compare_url "$compare_url" \
        '{method: $method, pr_url: null, compare_url: $compare_url}'
fi
