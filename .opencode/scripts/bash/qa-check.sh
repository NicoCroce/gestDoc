#!/usr/bin/env bash
# qa-check.sh — Corre tsc + eslint + vitest realmente en paralelo (background + wait)
# para el scope de una tarea, y devuelve un JSON estructurado con el resultado.
# Reemplaza el Paso 2 de la skill qa-runner / Paso 2 de blendverse-qa.md.
#
# Uso:
#   qa-check.sh <scope> [timeout_secs]
#     scope: back-only | front-only | full-stack
#     timeout_secs: opcional, default 180. Aplica a CADA comando lanzado
#       (tsc/lint/vitest), no al total.
#
# TIMEOUT (Opción B, decisión explícita del equipo): hay un hang pre-existente
# y documentado en los specs de Controllers — `vi.mock('@server/Infrastructure')`
# arrastra `TrpcInstance.ts` -> modelos Sequelize -> intenta conectar a MySQL
# real y se queda esperando para siempre. En vez de excluir esos tests (lo que
# ocultaría bugs reales en esa capa), este script corre TODO sin exclude y le
# pone un límite de tiempo real a cada comando: si se cumple el timeout, se
# mata el PROCESO Y TODOS SUS HIJOS (process group kill, no solo el PID
# principal — npx/vitest lanzan subprocesos que sobrevivirían a un kill simple)
# y el step se marca "TIMEOUT" (distinto de PASS/FAIL) en el reporte. Esto es
# intencional: el pipeline de QA queda bloqueado en tareas que toquen
# Controllers hasta que se arregle el mock de raíz — no se oculta el problema.
#
# Salida: un único JSON por stdout con {scope, status, steps: {typescript, lint, vitest}}.
# Cada step tiene {status: PASS|FAIL|TIMEOUT, output_tail} — output_tail solo
# se llena si status != PASS (máx. 20 líneas, ver "Regla de brevedad" de
# memory.instructions.md).
#
# Requiere: jq. Se ejecuta desde la raíz del monorepo (auto-detectada).

set -uo pipefail
set -m
# NOTA: no usamos "set -e" a propósito — tsc/eslint/vitest devuelven código de
# salida != 0 cuando encuentran errores, y necesitamos capturar ESE resultado,
# no abortar el script. "set -m" (monitor mode) fuerza a que cada job en
# background reciba su PROPIO process group — imprescindible para poder matar
# un comando + todos sus hijos con "kill -- -$pgid" cuando se cumple el timeout.

SCRIPT_DIR="$(CDPATH="" cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(CDPATH="" cd -- "$SCRIPT_DIR/../../.." && pwd)"

usage() {
    echo "Uso: $0 <back-only|front-only|full-stack> [timeout_secs]" >&2
    exit 1
}

require_jq() {
    if ! command -v jq >/dev/null 2>&1; then
        echo "ERROR: jq no está disponible." >&2
        exit 1
    fi
}

SCOPE="${1:-}"
TIMEOUT_SECS="${2:-180}"
case "$SCOPE" in
    back-only|front-only|full-stack) ;;
    *) usage ;;
esac
require_jq

TMP_DIR="$(mktemp -d)"

cleanup() {
    # Por las dudas: si algún comando o watchdog quedó vivo al salir, matarlo.
    local pf
    for pf in "$TMP_DIR"/*.pid; do
        [[ -f "$pf" ]] || continue
        local pid
        pid="$(cat "$pf")"
        kill -0 "$pid" 2>/dev/null && kill -KILL -- "-$pid" 2>/dev/null
    done
    rm -rf "$TMP_DIR"
}
trap cleanup EXIT

# --- Lanzar los comandos necesarios en paralelo (background), cada uno vuelca
#     su exit code y su output a archivos separados en $TMP_DIR. Cada uno tiene
#     su propio watchdog de timeout con kill de process group completo. ---

run_bg() {
    # run_bg <name> <workdir> <command...>
    local name="$1"; local workdir="$2"; shift 2

    # "exec" reemplaza la imagen del subshell por el comando real: el PID del
    # subshell pasa a ser el PID del comando (no queda un wrapper intermedio),
    # y con "set -m" ese PID es también el líder de su propio process group.
    (
        cd "$workdir" || exit 127
        exec "$@"
    ) > "$TMP_DIR/${name}.out" 2>&1 &
    local pid=$!
    echo "$pid" > "$TMP_DIR/${name}.pid"

    (
        sleep "$TIMEOUT_SECS"
        if kill -0 "$pid" 2>/dev/null; then
            echo "1" > "$TMP_DIR/${name}.timeout"
            kill -TERM -- "-$pid" 2>/dev/null
            sleep 3
            kill -KILL -- "-$pid" 2>/dev/null
        fi
    ) &
    echo $! > "$TMP_DIR/${name}.watchdog"
}

wait_bg() {
    # wait_bg <name> — espera al comando (no al watchdog) y guarda su exit code.
    # Si el watchdog ya lo mató, el exit code será el de la señal (irrelevante,
    # el status real se toma del archivo .timeout).
    local name="$1"
    local pid
    pid="$(cat "$TMP_DIR/${name}.pid")"
    wait "$pid" 2>/dev/null
    echo "$?" > "$TMP_DIR/${name}.exit"
    # El comando terminó (solo o por el watchdog) — cancelar el watchdog si sigue esperando.
    local wd
    wd="$(cat "$TMP_DIR/${name}.watchdog" 2>/dev/null || true)"
    [[ -n "$wd" ]] && kill "$wd" 2>/dev/null
}

case "$SCOPE" in
    back-only)
        NAMES=(tsc_server lint_server vitest_server)
        run_bg tsc_server "$REPO_ROOT/packages/server" npx tsc --noEmit
        run_bg lint_server "$REPO_ROOT" npx eslint "packages/server/src/**/*.{js,ts,tsx}"
        run_bg vitest_server "$REPO_ROOT/packages/server" npx vitest run
        ;;
    front-only)
        NAMES=(tsc_app lint_app vitest_app)
        run_bg tsc_app "$REPO_ROOT/packages/app" npx tsc --noEmit
        run_bg lint_app "$REPO_ROOT/packages/app" npx eslint .
        run_bg vitest_app "$REPO_ROOT/packages/app" npx vitest run
        ;;
    full-stack)
        NAMES=(tsc_server tsc_app lint_full vitest_server vitest_app)
        run_bg tsc_server "$REPO_ROOT/packages/server" npx tsc --noEmit
        run_bg tsc_app "$REPO_ROOT/packages/app" npx tsc --noEmit
        run_bg lint_full "$REPO_ROOT" pnpm lint
        run_bg vitest_server "$REPO_ROOT/packages/server" npx vitest run
        run_bg vitest_app "$REPO_ROOT/packages/app" npx vitest run
        ;;
esac

for n in "${NAMES[@]}"; do
    wait_bg "$n"
done

# --- Helpers de evaluación ---

is_timeout() {
    [[ -f "$TMP_DIR/$1.timeout" ]]
}

exit_code_of() {
    local f="$TMP_DIR/$1.exit"
    [[ -f "$f" ]] && cat "$f" || echo "-1"
}

output_of() {
    local f="$TMP_DIR/$1.out"
    [[ -f "$f" ]] && cat "$f" || echo ""
}

# tsc: TIMEOUT si el watchdog lo mató; si no, PASS solo si no hay "error TS".
eval_tsc() {
    local name="$1"
    if is_timeout "$name"; then echo "TIMEOUT"; return; fi
    local out
    out="$(output_of "$name")"
    if grep -q "error TS" <<<"$out"; then
        echo "FAIL"
    else
        echo "PASS"
    fi
}

# eslint: TIMEOUT si el watchdog lo mató; si no, PASS si exit code 0.
eval_lint() {
    local name="$1"
    if is_timeout "$name"; then echo "TIMEOUT"; return; fi
    [[ "$(exit_code_of "$name")" == "0" ]] && echo "PASS" || echo "FAIL"
}

# vitest: TIMEOUT si el watchdog lo mató (caso conocido: specs de Controllers);
# si no, PASS si exit code 0.
eval_vitest() {
    local name="$1"
    if is_timeout "$name"; then echo "TIMEOUT"; return; fi
    [[ "$(exit_code_of "$name")" == "0" ]] && echo "PASS" || echo "FAIL"
}

tail_lines() {
    # Últimas 20 líneas del output, solo se usa cuando el step no es PASS.
    output_of "$1" | tail -n 20
}

# --- Construir el JSON de typescript, lint y vitest según el scope ---

build_step_json() {
    # build_step_json <status> <name_a> [<name_b> ...]
    local status="$1"; shift
    if [[ "$status" == "PASS" ]]; then
        jq -n --arg status "$status" '{status: $status}'
    else
        local tail_text=""
        for n in "$@"; do
            if [[ "$status" == "TIMEOUT" ]] && ! is_timeout "$n"; then
                continue
            fi
            tail_text="${tail_text}--- ${n} ---"$'\n'"$(tail_lines "$n")"$'\n'
        done
        jq -n --arg status "$status" --arg tail "$tail_text" '{status: $status, output_tail: $tail}'
    fi
}

# Combina 1 o 2 sub-resultados en un único status: TIMEOUT > FAIL > PASS.
combine_status() {
    local a="$1"; local b="${2:-PASS}"
    if [[ "$a" == "TIMEOUT" || "$b" == "TIMEOUT" ]]; then echo "TIMEOUT"
    elif [[ "$a" == "FAIL" || "$b" == "FAIL" ]]; then echo "FAIL"
    else echo "PASS"; fi
}

case "$SCOPE" in
    back-only)
        ts_status="$(eval_tsc tsc_server)"
        lint_status="$(eval_lint lint_server)"
        vitest_status="$(eval_vitest vitest_server)"
        ts_json="$(build_step_json "$ts_status" tsc_server)"
        lint_json="$(build_step_json "$lint_status" lint_server)"
        vitest_json="$(build_step_json "$vitest_status" vitest_server)"
        ;;
    front-only)
        ts_status="$(eval_tsc tsc_app)"
        lint_status="$(eval_lint lint_app)"
        vitest_status="$(eval_vitest vitest_app)"
        ts_json="$(build_step_json "$ts_status" tsc_app)"
        lint_json="$(build_step_json "$lint_status" lint_app)"
        vitest_json="$(build_step_json "$vitest_status" vitest_app)"
        ;;
    full-stack)
        ts_server_status="$(eval_tsc tsc_server)"
        ts_app_status="$(eval_tsc tsc_app)"
        ts_status="$(combine_status "$ts_server_status" "$ts_app_status")"
        lint_status="$(eval_lint lint_full)"
        vitest_server_status="$(eval_vitest vitest_server)"
        vitest_app_status="$(eval_vitest vitest_app)"
        vitest_status="$(combine_status "$vitest_server_status" "$vitest_app_status")"
        ts_json="$(build_step_json "$ts_status" tsc_server tsc_app)"
        lint_json="$(build_step_json "$lint_status" lint_full)"
        vitest_json="$(build_step_json "$vitest_status" vitest_server vitest_app)"
        ;;
esac

overall="$(combine_status "$(combine_status "$ts_status" "$lint_status")" "$vitest_status")"

jq -n \
    --arg scope "$SCOPE" \
    --arg overall "$overall" \
    --argjson timeout_secs "$TIMEOUT_SECS" \
    --argjson ts "$ts_json" \
    --argjson lint "$lint_json" \
    --argjson vitest "$vitest_json" '
    {scope: $scope, status: $overall, timeout_secs: $timeout_secs, steps: {typescript: $ts, lint: $lint, vitest: $vitest}}
'
