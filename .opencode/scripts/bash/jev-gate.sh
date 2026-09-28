#!/usr/bin/env bash
# jev-gate.sh — Consulta a Jev (TypeSafe System One) en modo sombra desde los
# gates de @develop y registra su respuesta junto a la decisión del pipeline en
# memory/jev-decisions.jsonl. Nunca cambia el flujo: la salida solo informa si
# se registró, sin exponer las respuestas de Jev.
#
# Uso:
#   jev-gate.sh triage <feature_dir> [campo=valor ...]
#     Sobre spec.md: complejidad, scope back/front, dominio, alcance UI,
#     dudas materiales y skills de implementación. Los campo=valor (p. ej.
#     complexity=standard mode=auto domain=Users) se guardan como la decisión
#     del pipeline.
#
#   jev-gate.sh post-tasks <feature_dir>
#     Sobre tasks.md: una pregunta por tarea (¿es una tarea de tests?) y una por
#     FR de spec.md (¿alguna tarea lo implementa?). La decisión del pipeline se
#     calcula acá con los mismos grep de develop.md, más el scope por paths.
#
#   jev-gate.sh diff <feature_dir> <archivo> [campo=valor ...]
#     Sobre `git diff -U0 <archivo>`: ¿cambia una regla de negocio, criterio,
#     validación, modelo de datos o contrato? Pasar material=yes|no.
#
#   jev-gate.sh report [feature_key]
#     Resume el acuerdo entre Jev y el pipeline por gate (umbral JEV_THRESHOLD).
#
# Salida (gates): {"status":"recorded|skipped","gate":...,"reason"?}. Exit 0
# siempre, salvo error de uso (2). Con JEV_DRY_RUN=1 imprime el body del
# request en vez de enviarlo.
#
# Un 401 desactiva Jev para esa key: se guarda su hash en JEV_AUTH_MARKER y las
# llamadas siguientes salen `skipped` (auth_disabled) sin request ni log. Se
# reactiva solo al cambiar TYPESAFE_API_KEY o al borrar el marcador.
#
# Variables: TYPESAFE_API_KEY, JEV_MODEL (jev-1.13.0), JEV_TIMEOUT (20s),
# JEV_THRESHOLD (0.5), JEV_LOG (memory/jev-decisions.jsonl),
# JEV_AUTH_MARKER (.atl/jev-auth-failed).
# Requiere: jq, curl.

set -uo pipefail

SCRIPT_DIR="$(CDPATH="" cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(CDPATH="" cd -- "$SCRIPT_DIR/../../.." && pwd)"

API_URL="https://api.typesafe.ai/v1/systemone"
MODEL="${JEV_MODEL:-jev-1.13.0}"
TIMEOUT="${JEV_TIMEOUT:-20}"
THRESHOLD="${JEV_THRESHOLD:-0.5}"
LOG="${JEV_LOG:-$REPO_ROOT/memory/jev-decisions.jsonl}"
AUTH_MARKER="${JEV_AUTH_MARKER:-$REPO_ROOT/.atl/jev-auth-failed}"
MAX_STATE_CHARS=60000
MAX_ITEM_CHARS=400

usage() {
    echo "Uso:" >&2
    echo "  $0 triage <feature_dir> [campo=valor ...]" >&2
    echo "  $0 post-tasks <feature_dir>" >&2
    echo "  $0 diff <feature_dir> <archivo> [campo=valor ...]" >&2
    echo "  $0 report [feature_key]" >&2
    exit 2
}

GATE=""

emit() {
    # emit <status> [reason]
    if [[ -n "${2:-}" ]]; then
        printf '{"status":"%s","gate":"%s","reason":"%s"}\n' "$1" "$GATE" "$2"
    else
        printf '{"status":"%s","gate":"%s"}\n' "$1" "$GATE"
    fi
    exit 0
}

pairs_to_json() {
    local json='{}' arg
    for arg in "$@"; do
        [[ "$arg" == *"="* ]] || continue
        json="$(jq -c --arg k "${arg%%=*}" --arg v "${arg#*=}" '. + {($k): $v}' <<<"$json")"
    done
    printf '%s' "$json"
}

FEATURE_DIR=""

resolve_feature_dir() {
    FEATURE_DIR="${1:-}"
    [[ -n "$FEATURE_DIR" ]] || usage
    [[ "$FEATURE_DIR" = /* ]] || FEATURE_DIR="$REPO_ROOT/$FEATURE_DIR"
    [[ -d "$FEATURE_DIR" ]] || emit skipped "feature_dir_not_found"
}

append_log() {
    mkdir -p "$(dirname "$LOG")"
    printf '%s\n' "$1" >>"$LOG"
}

# call_jev <feature> <state_file> <questions_json> <pipeline_json>
# Envía el request, registra el resultado (o el error) y termina con emit.
call_jev() {
    local feature="$1" state_file="$2" questions="$3" pipeline="$4"
    local body_file resp_file
    body_file="$(mktemp)"
    resp_file="$(mktemp)"
    trap 'rm -f "$body_file" "$resp_file" "$state_file"' EXIT

    jq -n --slurpfile state "$state_file" --argjson questions "$questions" --arg model "$MODEL" \
        '{state: $state[0], model: $model, questions: $questions}' >"$body_file"

    if [[ "${JEV_DRY_RUN:-}" == "1" ]]; then
        jq '.' "$body_file"
        exit 0
    fi
    [[ -n "${TYPESAFE_API_KEY:-}" ]] || emit skipped "no_api_key"

    local key_hash
    key_hash="$(printf '%s' "$TYPESAFE_API_KEY" | shasum -a 256 | cut -d' ' -f1)"
    if [[ -f "$AUTH_MARKER" ]]; then
        [[ "$(cat "$AUTH_MARKER")" == "$key_hash" ]] && emit skipped "auth_disabled"
        rm -f "$AUTH_MARKER"
    fi

    local meta http_code seconds
    meta="$(curl -sS -o "$resp_file" -w '%{http_code} %{time_total}' --max-time "$TIMEOUT" \
        -X POST "$API_URL" \
        -H "Authorization: Bearer $TYPESAFE_API_KEY" \
        -H "Content-Type: application/json" \
        --data-binary @"$body_file" 2>/dev/null)" || meta="000 ${meta#* }"
    http_code="${meta%% *}"
    seconds="${meta#* }"
    [[ "$seconds" =~ ^[0-9.]+$ ]] || seconds=0

    if [[ "$http_code" == "401" ]]; then
        mkdir -p "$(dirname "$AUTH_MARKER")"
        printf '%s' "$key_hash" >"$AUTH_MARKER"
        emit skipped "http_401"
    fi

    local ts
    ts="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    if [[ "$http_code" != "200" ]] || ! jq -e '.answers' "$resp_file" >/dev/null 2>&1; then
        local detail
        detail="$(head -c 300 "$resp_file" 2>/dev/null || true)"
        append_log "$(jq -nc --arg ts "$ts" --arg f "$feature" --arg g "$GATE" --arg m "$MODEL" \
            --arg e "http_$http_code" --arg d "$detail" --argjson p "$pipeline" \
            '{ts: $ts, feature: $f, gate: $g, model: $m, error: $e, detail: $d, pipeline: $p}')"
        [[ "$http_code" == "000" ]] && emit skipped "timeout_or_network"
        emit skipped "http_$http_code"
    fi

    append_log "$(jq -c --arg ts "$ts" --arg f "$feature" --arg g "$GATE" \
        --argjson s "$seconds" --argjson p "$pipeline" \
        '{ts: $ts, feature: $f, gate: $g, model: .model, seconds: $s, usage: .usage,
          pipeline: $p, jev: .answers}' "$resp_file")"
    emit recorded
}

# --- triage --------------------------------------------------------------------

cmd_triage() {
    resolve_feature_dir "${1:-}"
    shift
    local dir="$FEATURE_DIR"
    [[ -s "$dir/spec.md" ]] || emit skipped "no_spec"

    local domains
    domains="$(find "$REPO_ROOT/packages/server/src/domains" "$REPO_ROOT/packages/app/src/Domains" \
        -mindepth 1 -maxdepth 1 -type d -exec basename {} \; 2>/dev/null \
        | jq -Rn '[inputs | select(length > 0)] | group_by(ascii_downcase | gsub("_"; "")) | map(.[0])')"

    local questions
    questions="$(jq -n --argjson domains "$domains" '
        def noul($i): {type: "noul", instructions: $i};
        {
          complexity: {type: "choice", instructions: "How complex is the change described in the `spec`?",
            criteria: {
              simple: "A localized fix in one or two known files, with no data model, UX or integration changes and no ambiguity",
              standard: "Anything larger than a localized fix: several files or layers, data model, UX, integrations or open decisions"
            }},
          scope: {type: "choice", instructions: "Which parts of the monorepo does implementing the `spec` change?",
            criteria: {
              back_only: "Only the backend: API, database, use cases, emails, scheduled jobs",
              front_only: "Only the frontend: screens, components, forms, client-side behavior",
              full_stack: "Both the backend and the frontend"
            }},
          domain: {type: "choice", instructions: "Which business domain of the application does the `spec` mainly belong to?",
            criteria: (reduce $domains[] as $d ({}; . + {($d): "The existing \($d) domain"})
              + {new_domain: "A new domain that does not exist yet in the application"})},
          ui_scope: noul("Implementing the `spec` requires creating or changing user interface screens or components"),
          touches_data_model: noul("Implementing the `spec` requires creating or changing database tables, columns or relations"),
          touches_permissions: noul("Implementing the `spec` changes who is allowed to see or do something (roles, permissions, tenant access)"),
          new_integration: noul("Implementing the `spec` requires integrating a new external service or API"),
          unclear_scope: noul("The `spec` leaves the scope of the feature ambiguous or undefined"),
          unclear_data_model: noul("The `spec` leaves a data model decision open or ambiguous"),
          unclear_permissions: noul("The `spec` leaves open or ambiguous who is allowed to see or do something"),
          unclear_integration: noul("The `spec` leaves open or ambiguous how an external service or API is integrated"),
          unclear_ux: noul("The `spec` leaves an essential user experience decision open or ambiguous"),
          skill_back_ddd_generator: noul("Implementing the `spec` requires creating a new backend domain from scratch (entity, repository, use cases, database model, API routes)"),
          skill_front_ddd_generator: noul("Implementing the `spec` requires creating a new frontend domain from scratch (types, API service, routes, hooks, pages)"),
          skill_cross_domain_relations: noul("Implementing the `spec` requires one backend domain to read or combine data owned by another domain"),
          skill_sequelize_associations: noul("Implementing the `spec` requires defining or querying relations between database models (joins, includes)"),
          skill_email_notifications: noul("Implementing the `spec` requires sending a new email or changing an existing email notification, template or reminder"),
          skill_frontend_design: noul("Implementing the `spec` requires designing new screens or reshaping the visual layout of existing ones")
        }')"

    local state_file
    state_file="$(mktemp)"
    jq -n --rawfile spec "$dir/spec.md" --argjson max "$MAX_STATE_CHARS" '{spec: $spec[0:$max]}' >"$state_file"

    call_jev "$(basename "$dir")" "$state_file" "$questions" "$(pairs_to_json "$@")"
}

# --- post-tasks ----------------------------------------------------------------

cmd_post_tasks() {
    resolve_feature_dir "${1:-}"
    local dir="$FEATURE_DIR"
    [[ -s "$dir/tasks.md" ]] || emit skipped "no_tasks"
    [[ -s "$dir/spec.md" ]] || emit skipped "no_spec"

    local tasks frs
    tasks="$(jq -Rn --argjson max "$MAX_ITEM_CHARS" '
        [inputs | capture("^- \\[[ xX]\\] (?<id>T[0-9]+) (?<text>.*)$") | .text |= .[0:$max]]' <"$dir/tasks.md")"
    frs="$(jq -Rn --argjson max "$MAX_ITEM_CHARS" '
        [inputs | capture("^- \\*\\*(?<id>FR-[0-9]+)\\*\\*:? *(?<text>.*)$") | .text |= .[0:$max]]' <"$dir/spec.md")"
    [[ "$(jq 'length' <<<"$tasks")" -gt 0 ]] || emit skipped "no_task_ids"

    local questions
    questions="$(jq -n --argjson tasks "$tasks" --argjson frs "$frs" '
        (reduce $tasks[] as $t ({}; . + {("test_" + $t.id): {type: "noul",
            instructions: "This task consists of writing or updating automated tests: \"\($t.text)\""}}))
        + (reduce $frs[] as $r ({}; . + {("cover_" + ($r.id | gsub("-"; "_"))): {type: "noul",
            instructions: "At least one item in `tasks` implements this requirement: \"\($r.text)\""}}))')"

    local back front scope ui
    back="$(grep -c "packages/server/" "$dir/tasks.md" || true)"
    front="$(grep -c "packages/app/" "$dir/tasks.md" || true)"
    if [[ "$back" -gt 0 && "$front" -gt 0 ]]; then scope="full-stack"
    elif [[ "$front" -gt 0 ]]; then scope="front-only"
    else scope="back-only"; fi
    if [[ -s "$dir/frontend-design.md" ]]; then ui=true; else ui=false; fi

    local pipeline
    pipeline="$(jq -n --argjson tasks "$tasks" --argjson frs "$frs" --rawfile raw "$dir/tasks.md" \
        --arg scope "$scope" --argjson ui "$ui" '{
          scope: $scope,
          ui_scope: $ui,
          test_tasks: [$tasks[] | select(.text | test("vitest|\\.spec\\.|write tests|escribir tests"; "i")) | "test_" + .id],
          fr_missing: [$frs[] | .id as $id | select($raw | contains($id) | not) | "cover_" + ($id | gsub("-"; "_"))]
        }')"

    local state_file
    state_file="$(mktemp)"
    jq -n --argjson tasks "$tasks" '{tasks: [$tasks[] | "\(.id) \(.text)"]}' >"$state_file"

    call_jev "$(basename "$dir")" "$state_file" "$questions" "$pipeline"
}

# --- diff ----------------------------------------------------------------------

cmd_diff() {
    resolve_feature_dir "${1:-}"
    local dir="$FEATURE_DIR" file="${2:-}"
    [[ -n "$file" ]] || usage
    shift 2

    local diff_text
    diff_text="$(git -C "$REPO_ROOT" diff -U0 -- "$file" 2>/dev/null || true)"
    [[ -n "$diff_text" ]] || emit skipped "no_diff"

    local questions
    questions="$(jq -n '
        def noul($i): {type: "noul", instructions: $i};
        {
          business_rule: noul("The `diff` changes a business rule"),
          acceptance_criteria: noul("The `diff` adds, removes or changes an acceptance criterion or acceptance scenario"),
          validation: noul("The `diff` changes an input validation rule"),
          data_model: noul("The `diff` changes the data model (tables, columns, fields or relations)"),
          contract: noul("The `diff` changes an API contract (endpoint, input or output shape)"),
          wording_only: noul("The `diff` only changes wording, formatting or typos without changing the meaning")
        }')"

    local state_file
    state_file="$(mktemp)"
    jq -n --arg file "$file" --arg diff "$diff_text" --argjson max "$MAX_STATE_CHARS" \
        '{file: $file, diff: $diff[0:$max]}' >"$state_file"

    call_jev "$(basename "$dir")" "$state_file" "$questions" \
        "$(pairs_to_json "file=$file" "$@")"
}

# --- report --------------------------------------------------------------------

cmd_report() {
    local feature="${1:-}"
    [[ -s "$LOG" ]] || { echo '{"records":0}'; exit 0; }

    jq -s --argjson t "$THRESHOLD" --arg f "$feature" '
        def yes: (.noul // 0) >= $t;
        def keys_where(prefix; cond): [to_entries[] | select((.key | startswith(prefix)) and (.value | cond)) | .key];
        def compare(jev; code; all): {
          compared: (all | length),
          agree: ((all | length) - ((jev - code) | length) - ((code - jev) | length)),
          jev_only: (jev - code),
          code_only: (code - jev)
        };

        map(select($f == "" or .feature == $f)) as $all
        | ($all | map(select(.error == null))) as $ok
        | ($ok | map(select(.gate == "triage"))) as $tri
        | ($ok | map(select(.gate == "post-tasks"))) as $post
        | ($ok | map(select(.gate == "diff"))) as $diff
        | {
            threshold: $t,
            records: ($all | length),
            errors: ($all | map(select(.error != null)) | group_by(.error) | map({(.[0].error): length}) | add // {}),
            complexity: ($tri | map(select(.pipeline.complexity != null)) | {
              compared: length,
              agree: (map(select(.jev.complexity.choice == .pipeline.complexity)) | length),
              disagreements: map(select(.jev.complexity.choice != .pipeline.complexity)
                | {feature, pipeline: .pipeline.complexity, jev: .jev.complexity.choice, confidence: .jev.complexity.confidence})
            }),
            domain: ($tri | map(select(.pipeline.domain != null)
                | {feature, pipeline: .pipeline.domain, jev: (.jev.domain.choice | if . == "new_domain" then "new" else . end),
                   confidence: .jev.domain.confidence})
              | {compared: length, agree: (map(select(.jev == .pipeline)) | length), disagreements: map(select(.jev != .pipeline))}),
            scope: ([$ok | group_by(.feature)[]
                | {tri: (map(select(.gate == "triage")) | last), post: (map(select(.gate == "post-tasks")) | last)}
                | select(.tri != null and .post != null)
                | {feature: .tri.feature, pipeline: .post.pipeline.scope, jev: (.tri.jev.scope.choice | gsub("_"; "-")),
                   confidence: .tri.jev.scope.confidence}]
              | {compared: length, agree: (map(select(.jev == .pipeline)) | length), disagreements: map(select(.jev != .pipeline))}),
            ui_scope: ([$ok | group_by(.feature)[]
                | {tri: (map(select(.gate == "triage")) | last), post: (map(select(.gate == "post-tasks")) | last)}
                | select(.tri != null and .post != null)
                | {feature: .tri.feature, pipeline: .post.pipeline.ui_scope, jev: (.tri.jev.ui_scope | yes)}]
              | {compared: length, agree: (map(select(.jev == .pipeline)) | length), disagreements: map(select(.jev != .pipeline))}),
            test_tasks: ($post | map(.feature as $fk
                | (.jev | keys_where("test_"; yes)) as $j
                | (.jev | keys_where("test_"; true)) as $a
                | compare($j | map($fk + "/" + .); .pipeline.test_tasks | map($fk + "/" + .); $a))
              | {compared: (map(.compared) | add // 0), agree: (map(.agree) | add // 0),
                 jev_only: (map(.jev_only) | add // []), code_only: (map(.code_only) | add // [])}),
            fr_missing: ($post | map(.feature as $fk
                | (.jev | keys_where("cover_"; yes | not)) as $j
                | (.jev | keys_where("cover_"; true)) as $a
                | compare($j | map($fk + "/" + .); .pipeline.fr_missing | map($fk + "/" + .); $a))
              | {compared: (map(.compared) | add // 0), agree: (map(.agree) | add // 0),
                 jev_only: (map(.jev_only) | add // []), code_only: (map(.code_only) | add // [])}),
            diff_material: ($diff | map(select(.pipeline.material != null)
                | {feature, file: .pipeline.file, pipeline: (.pipeline.material == "yes"),
                   jev: ([.jev.business_rule, .jev.acceptance_criteria, .jev.validation, .jev.data_model, .jev.contract] | map(yes) | any)})
              | {compared: length, agree: (map(select(.jev == .pipeline)) | length), disagreements: map(select(.jev != .pipeline))}),
            skills: ($tri | map({feature, suggested: (.jev | keys_where("skill_"; yes) | map(ltrimstr("skill_") | gsub("_"; "-")))}))
          }' "$LOG"
}

main() {
    local subcommand="${1:-}"
    shift || true
    command -v jq >/dev/null 2>&1 || { echo '{"status":"skipped","reason":"no_jq"}'; exit 0; }
    case "$subcommand" in
        triage) GATE="triage"; cmd_triage "$@" ;;
        post-tasks) GATE="post-tasks"; cmd_post_tasks "$@" ;;
        diff) GATE="diff"; cmd_diff "$@" ;;
        report) cmd_report "$@" ;;
        *) usage ;;
    esac
}

main "$@"
