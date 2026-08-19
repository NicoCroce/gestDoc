#!/usr/bin/env bash
# audit-arch.sh — Verifica que cada archivo de una lista (affected_files) esté
# en la carpeta correcta según las convenciones DDD/Hexagonal del proyecto
# (server.instructions.md / app.instructions.md). Reemplaza el Paso 3 de la
# skill qa-runner ("Verificación de Estructura de Carpetas").
#
# NO reemplaza la skill `arch-audit` (que hace un escaneo completo del
# proyecto para @blendverse-arch-fixer — tipos legacy, di.ts, naming, stubs).
# Este script es más acotado: dado un archivo puntual, ¿su ubicación coincide
# con el patrón esperado para su tipo (por sufijo de nombre)?
#
# Uso:
#   audit-arch.sh check <archivo1> [archivo2] ...
#     Rutas relativas a la raíz del repo (ej. packages/server/src/domains/X/Domain/X.entity.ts).
#
# Salida: JSON {results: [{file, status: OK|MISPLACED|UNKNOWN, expected, actual}], summary: {ok, misplaced, unknown}}
#
# NOTA sobre la carpeta de persistencia del backend (Database/Databases/Repository):
# el proyecto real tiene variación existente (Certificates usa "Databases", Auth
# usa "Repository", el resto usa "Database"). Este script NO exige un nombre
# exacto para esa subcarpeta — solo que los archivos *.model.ts /
# *Repository.implementation.ts estén bajo Infrastructure/ y NO mezclados con
# Controllers/ ni Routes/. Exigir el nombre exacto generaría falsos positivos
# masivos contra código ya aceptado en el proyecto.
#
# Requiere: jq.

set -uo pipefail

usage() {
    echo "Uso: $0 check <archivo1> [archivo2] ..." >&2
    exit 1
}

require_jq() {
    if ! command -v jq >/dev/null 2>&1; then
        echo "ERROR: jq no está disponible." >&2
        exit 1
    fi
}

# classify_backend <path> -> imprime "OK|MISPLACED|UNKNOWN<TAB>expected<TAB>actual"
classify_backend() {
    local path="$1"
    local base
    base="$(basename "$path")"
    local dir
    dir="$(dirname "$path")"

    case "$base" in
        *.entity.ts)
            [[ "$dir" =~ /Domain$ ]] && echo -e "OK\tDomain/\t${dir}" || echo -e "MISPLACED\tDomain/\t${dir}"
            ;;
        *.repository.ts|*.respository.ts)
            [[ "$dir" =~ /Domain$ ]] && echo -e "OK\tDomain/\t${dir}" || echo -e "MISPLACED\tDomain/\t${dir}"
            ;;
        *.types.ts)
            [[ "$dir" =~ /Application$ ]] && echo -e "OK\tApplication/\t${dir}" || echo -e "MISPLACED\tApplication/\t${dir}"
            ;;
        *.usecase.ts)
            [[ "$dir" =~ /Application/UseCases$ ]] && echo -e "OK\tApplication/UseCases/\t${dir}" || echo -e "MISPLACED\tApplication/UseCases/\t${dir}"
            ;;
        *.service.ts)
            [[ "$dir" =~ /Application$ ]] && echo -e "OK\tApplication/\t${dir}" || echo -e "MISPLACED\tApplication/\t${dir}"
            ;;
        *.controller.ts)
            [[ "$dir" =~ /Infrastructure/Controllers$ ]] && echo -e "OK\tInfrastructure/Controllers/\t${dir}" || echo -e "MISPLACED\tInfrastructure/Controllers/\t${dir}"
            ;;
        *.routes.ts)
            [[ "$dir" =~ /Infrastructure/Routes$ ]] && echo -e "OK\tInfrastructure/Routes/\t${dir}" || echo -e "MISPLACED\tInfrastructure/Routes/\t${dir}"
            ;;
        *.model.ts|*Repository.implementation.ts)
            if [[ "$dir" =~ /Infrastructure/[^/]+$ ]] && [[ ! "$dir" =~ /Infrastructure/(Controllers|Routes)$ ]]; then
                echo -e "OK\tInfrastructure/<persistencia>/\t${dir}"
            else
                echo -e "MISPLACED\tInfrastructure/<persistencia>/ (no Controllers/Routes)\t${dir}"
            fi
            ;;
        *.di.ts)
            # Debe estar en la raíz del dominio: .../domains/{Domain}/{domain}.di.ts
            if [[ "$dir" =~ /domains/[^/]+$ ]]; then
                echo -e "OK\traíz del dominio\t${dir}"
            else
                echo -e "MISPLACED\traíz del dominio\t${dir}"
            fi
            ;;
        index.ts)
            # Barrel válido en cualquier capa (Domain/Application/Infrastructure/UseCases/raíz)
            echo -e "OK\tbarrel (cualquier capa)\t${dir}"
            ;;
        *.spec.ts|*.test.ts)
            [[ "$dir" =~ /specs$ ]] && echo -e "OK\t.../specs/\t${dir}" || echo -e "MISPLACED\t.../specs/\t${dir}"
            ;;
        *)
            echo -e "UNKNOWN\t(sin patrón conocido)\t${dir}"
            ;;
    esac
}

# classify_frontend <path> -> mismo formato que classify_backend
classify_frontend() {
    local path="$1"
    local base
    base="$(basename "$path")"
    local dir
    dir="$(dirname "$path")"

    case "$base" in
        *.entity.ts|*.service.ts|*.routes.ts|*.routes.tsx|*.router.tsx)
            # Viven en la raíz del dominio: .../Domains/{Domain}/
            if [[ "$dir" =~ /Domains/[^/]+$ ]]; then
                echo -e "OK\traíz del dominio\t${dir}"
            else
                echo -e "MISPLACED\traíz del dominio\t${dir}"
            fi
            ;;
        use*.ts|use*.tsx)
            [[ "$dir" =~ /Hooks$ ]] && echo -e "OK\tHooks/\t${dir}" || echo -e "MISPLACED\tHooks/\t${dir}"
            ;;
        *.page.tsx)
            [[ "$dir" =~ /Pages$ ]] && echo -e "OK\tPages/\t${dir}" || echo -e "MISPLACED\tPages/\t${dir}"
            ;;
        index.ts|index.tsx)
            echo -e "OK\tbarrel (cualquier carpeta)\t${dir}"
            ;;
        *.spec.tsx|*.spec.ts|*.test.tsx|*.test.ts)
            [[ "$dir" =~ /specs$ ]] && echo -e "OK\t.../specs/\t${dir}" || echo -e "MISPLACED\t.../specs/\t${dir}"
            ;;
        *.tsx)
            # Componente suelto (ni page, ni router) -> se espera en Components/
            [[ "$dir" =~ /Components(/.*)?$ ]] && echo -e "OK\tComponents/\t${dir}" || echo -e "MISPLACED\tComponents/\t${dir}"
            ;;
        *)
            echo -e "UNKNOWN\t(sin patrón conocido)\t${dir}"
            ;;
    esac
}

classify_one() {
    local path="$1"
    local result
    if [[ "$path" == packages/server/src/domains/* ]]; then
        result="$(classify_backend "$path")"
    elif [[ "$path" == packages/app/src/Domains/* ]]; then
        result="$(classify_frontend "$path")"
    else
        result="$(echo -e "UNKNOWN\tfuera de packages/server/src/domains o packages/app/src/Domains\t$(dirname "$path")")"
    fi

    local status expected actual
    IFS=$'\t' read -r status expected actual <<<"$result"
    jq -n --arg file "$path" --arg status "$status" --arg expected "$expected" --arg actual "$actual" \
        '{file: $file, status: $status, expected: $expected, actual: $actual}'
}

cmd_check() {
    [[ $# -ge 1 ]] || usage
    require_jq

    local results="[]"
    local ok=0 misplaced=0 unknown=0

    for f in "$@"; do
        local entry
        entry="$(classify_one "$f")"
        results="$(jq --argjson e "$entry" '. + [$e]' <<<"$results")"
        case "$(jq -r '.status' <<<"$entry")" in
            OK) ok=$((ok+1)) ;;
            MISPLACED) misplaced=$((misplaced+1)) ;;
            UNKNOWN) unknown=$((unknown+1)) ;;
        esac
    done

    jq -n --argjson results "$results" --argjson ok "$ok" --argjson misplaced "$misplaced" --argjson unknown "$unknown" \
        '{results: $results, summary: {ok: $ok, misplaced: $misplaced, unknown: $unknown}}'
}

main() {
    local subcommand="${1:-}"
    shift || true
    case "$subcommand" in
        check) cmd_check "$@" ;;
        *) usage ;;
    esac
}

main "$@"
