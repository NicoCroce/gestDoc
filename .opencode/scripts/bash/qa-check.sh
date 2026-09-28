#!/usr/bin/env bash
# qa-check.sh — Validación estática acotada (tsc + eslint + vitest) en paralelo.
# Devuelve un único JSON por stdout.
#
# Uso:
#   qa-check.sh <scope> [archivo ...]
#     scope: back-only | front-only | full-stack
#     archivo: rutas relativas a la raíz del repo (affected_files del dev log).
#
#   Con archivos: los paquetes a validar se derivan de las rutas; eslint corre
#   solo sobre esos archivos y vitest usa `related` (specs que los importan).
#   Sin archivos: valida los paquetes completos del scope.
#   tsc siempre corre sobre el paquete completo (no se puede acotar sin romper
#   los path aliases), pero incremental.
#
#   QA_TIMEOUT (env, default 120): límite en segundos por comando. Al vencer se
#   mata el process group completo y el step queda TIMEOUT.
#
# Salida: {scope, status, timeout_secs, files, steps: {typescript, lint, vitest}}.
# Cada step: {status: PASS|FAIL|TIMEOUT|SKIPPED, output_tail?}; output_tail
# (máx. 20 líneas por comando) solo cuando status es FAIL o TIMEOUT.
#
# Requiere: jq. Se ejecuta desde cualquier directorio.

set -uo pipefail
set -m

SCRIPT_DIR="$(CDPATH="" cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(CDPATH="" cd -- "$SCRIPT_DIR/../../.." && pwd)"
CACHE_DIR="node_modules/.cache/qa-check"

usage() {
    echo "Uso: $0 <back-only|front-only|full-stack> [archivo ...]" >&2
    exit 1
}

command -v jq >/dev/null 2>&1 || { echo "ERROR: jq no está disponible." >&2; exit 1; }

SCOPE="${1:-}"
case "$SCOPE" in
    back-only|front-only|full-stack) shift ;;
    *) usage ;;
esac
TIMEOUT_SECS="${QA_TIMEOUT:-120}"

SERVER_FILES=()
APP_FILES=()
for f in "$@"; do
    [[ -f "$REPO_ROOT/$f" ]] || continue
    case "$f" in
        packages/server/*.ts) SERVER_FILES+=("${f#packages/server/}") ;;
        packages/app/*.ts|packages/app/*.tsx) APP_FILES+=("${f#packages/app/}") ;;
    esac
done

RUN_SERVER=false
RUN_APP=false
if [[ $# -gt 0 ]]; then
    [[ ${#SERVER_FILES[@]} -gt 0 ]] && RUN_SERVER=true
    [[ ${#APP_FILES[@]} -gt 0 ]] && RUN_APP=true
else
    [[ "$SCOPE" != "front-only" ]] && RUN_SERVER=true
    [[ "$SCOPE" != "back-only" ]] && RUN_APP=true
fi

TMP_DIR="$(mktemp -d)"
cleanup() {
    local pf pid
    for pf in "$TMP_DIR"/*.pid "$TMP_DIR"/*.watchdog; do
        [[ -f "$pf" ]] || continue
        pid="$(cat "$pf")"
        kill -0 "$pid" 2>/dev/null && kill -KILL -- "-$pid" 2>/dev/null
    done
    rm -rf "$TMP_DIR"
}
trap cleanup EXIT

NAMES=()

# run_bg <name> <workdir> <command...> — con "set -m" cada job tiene su propio
# process group, así el watchdog puede matar el comando y todos sus hijos.
run_bg() {
    local name="$1" workdir="$2"; shift 2
    NAMES+=("$name")
    ( cd "$workdir" || exit 127; exec "$@" ) > "$TMP_DIR/$name.out" 2>&1 &
    local pid=$!
    echo "$pid" > "$TMP_DIR/$name.pid"
    (
        sleep "$TIMEOUT_SECS"
        if kill -0 "$pid" 2>/dev/null; then
            echo 1 > "$TMP_DIR/$name.timeout"
            kill -TERM -- "-$pid" 2>/dev/null
            sleep 3
            kill -KILL -- "-$pid" 2>/dev/null
        fi
    ) >/dev/null 2>&1 &
    echo $! > "$TMP_DIR/$name.watchdog"
}

run_package() {
    # run_package <server|app> <files...>
    local pkg="$1"; shift
    local dir="$REPO_ROOT/packages/$pkg"
    mkdir -p "$dir/$CACHE_DIR"
    local lint_cache="packages/$pkg/$CACHE_DIR/eslint"
    run_bg "tsc_$pkg" "$dir" npx tsc --noEmit --incremental --tsBuildInfoFile "$CACHE_DIR/tsc.tsbuildinfo"
    # eslint corre desde la raíz con la config raíz, igual que `pnpm lint`.
    if [[ $# -gt 0 ]]; then
        run_bg "lint_$pkg" "$REPO_ROOT" npx eslint --cache --cache-location "$lint_cache" "${@/#/packages/$pkg/}"
        run_bg "vitest_$pkg" "$dir" npx vitest related --run --passWithNoTests "$@"
    else
        run_bg "lint_$pkg" "$REPO_ROOT" npx eslint --cache --cache-location "$lint_cache" "packages/$pkg/src/**/*.{js,ts,tsx}"
        run_bg "vitest_$pkg" "$dir" npx vitest run
    fi
}

$RUN_SERVER && run_package server "${SERVER_FILES[@]+"${SERVER_FILES[@]}"}"
$RUN_APP && run_package app "${APP_FILES[@]+"${APP_FILES[@]}"}"

for n in "${NAMES[@]+"${NAMES[@]}"}"; do
    wait "$(cat "$TMP_DIR/$n.pid")" 2>/dev/null
    echo "$?" > "$TMP_DIR/$n.exit"
    # El watchdog tiene su propio process group: matarlo entero (incluido su sleep).
    kill -- "-$(cat "$TMP_DIR/$n.watchdog")" 2>/dev/null
done

status_of() {
    local n="$1"
    [[ -f "$TMP_DIR/$n.out" ]] || { echo SKIPPED; return; }
    [[ -f "$TMP_DIR/$n.timeout" ]] && { echo TIMEOUT; return; }
    if [[ "$n" == tsc_* ]]; then
        grep -q "error TS" "$TMP_DIR/$n.out" && echo FAIL || echo PASS
    else
        [[ "$(cat "$TMP_DIR/$n.exit")" == "0" ]] && echo PASS || echo FAIL
    fi
}

# Precedencia: TIMEOUT > FAIL > PASS > SKIPPED.
combine() {
    local out=SKIPPED s
    for s in "$@"; do
        case "$s" in
            TIMEOUT) out=TIMEOUT ;;
            FAIL) [[ "$out" != TIMEOUT ]] && out=FAIL ;;
            PASS) [[ "$out" == SKIPPED ]] && out=PASS ;;
        esac
    done
    echo "$out"
}

step_json() {
    # step_json <kind>  (tsc | lint | vitest)
    local kind="$1" statuses=() tail_text="" n s
    for n in "${kind}_server" "${kind}_app"; do
        s="$(status_of "$n")"
        statuses+=("$s")
        if [[ "$s" == FAIL || "$s" == TIMEOUT ]]; then
            tail_text+="--- $n ($s) ---"$'\n'"$(tail -n 20 "$TMP_DIR/$n.out")"$'\n'
        fi
    done
    local status
    status="$(combine "${statuses[@]}")"
    if [[ -n "$tail_text" ]]; then
        jq -n --arg s "$status" --arg t "$tail_text" '{status: $s, output_tail: $t}'
    else
        jq -n --arg s "$status" '{status: $s}'
    fi
}

ts_json="$(step_json tsc)"
lint_json="$(step_json lint)"
vitest_json="$(step_json vitest)"
overall="$(combine "$(jq -r .status <<<"$ts_json")" "$(jq -r .status <<<"$lint_json")" "$(jq -r .status <<<"$vitest_json")")"
[[ "$overall" == SKIPPED ]] && overall=PASS

jq -n \
    --arg scope "$SCOPE" \
    --arg overall "$overall" \
    --argjson timeout_secs "$TIMEOUT_SECS" \
    --argjson files "$(printf '%s\n' "$@" | jq -R . | jq -s 'map(select(length > 0))')" \
    --argjson ts "$ts_json" \
    --argjson lint "$lint_json" \
    --argjson vitest "$vitest_json" \
    '{scope: $scope, status: $overall, timeout_secs: $timeout_secs, files: $files, steps: {typescript: $ts, lint: $lint, vitest: $vitest}}'
