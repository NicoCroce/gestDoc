<!--
SYNC IMPACT REPORT
Version change: 2.1.0 → 3.0.0 (MAJOR — redefinición de los principios IV y V)

Modified principles:
  - IV. Flujo de Agentes Orquestado — se elimina la capa de adapters @blendverse-design-*:
    @develop invoca directamente a @speckit-* con la política MacroGest inline. La QA pasa
    a ser un script (qa-report.sh); tester y reviewer corren en paralelo; un fallo produce
    un único retry con feedback combinado.
  - V. Tests por Regla de Negocio — la QA ya no es un agente; valida con `vitest related`
    sobre los affected_files.

Removed sections:
  - Tabla de agentes y skills (vive en AGENTS.md y en los propios agentes/skills).
  - Historial detallado de versiones 1.x/2.x (disponible en git).

Follow-up TODOs:
  - ⚠ Dominios del server que aún exportan `./Infrastructure` completo desde su barrel
    (`Auth`, `Users`, `Documents`, etc.) → refactor a rutas directas (`@blendverse-arch-fixer`).
-->

# MacroGest Core Constitution

- Project: MacroGest Core — Modular Monolith con DDD y Arquitectura Hexagonal
- Version: 3.0.0 · Ratified: 2026-05-17 · Last Amended: 2026-09-24

## Core Principles

### I. Arquitectura Hexagonal / DDD (NON-NEGOTIABLE)

- Capas por dominio en `packages/server/src/domains/[Domain]/`: `Domain/`, `Application/`, `Infrastructure/` (incl. `Routes/`), `Presentation/` y `[domain].di.ts`.
- DTOs de entrada/salida con Zod (`z.infer<typeof Schema>`) en `Application/[domain].types.ts`.
- Repositorios: puertos abstractos en `Domain/`, implementados en `Infrastructure/`, inyectados con Awilix.
- Specs dentro de su capa, en una carpeta `specs/` que espeja la estructura del dominio.
- El `index.ts` público de un dominio es un barrel puro (`./Domain`, `./Application`, `./Infrastructure/Routes`, `./[domain].di`); nunca `./Infrastructure` completo ni lógica.
- Dentro de `packages/server/src/Infrastructure/**` y en los `*.model.ts` se importan submódulos concretos, nunca el barrel `@server/Infrastructure`.
- Normativa detallada: `.opencode/instructions/server.instructions.md` y `app.instructions.md`.

### II. Multi-Tenant Obligatorio (NON-NEGOTIABLE)

- Toda query filtra por `RequestContext.values.ownerId`, obtenido EXCLUSIVAMENTE de `RequestContext`, nunca del cliente.
- Prohibido `id_propietario` en los schemas Zod de entrada.
- Un incumplimiento es CRITICAL en la revisión.
- Los tests de negocio incluyen al menos un caso multi-tenant.

### III. TypeScript Estricto + Zod (NON-NEGOTIABLE)

- Prohibido `any` explícito.
- Backend: Zod en `procedure.input`, tipos con `z.infer`.
- Frontend: tipos con `inferRouterOutputs<typeof T[Domain]Router>`; solo `TEntitySearch` se escribe a mano.
- No duplicar tipos: derivar del contrato tRPC/Zod. Si un template de `back-ddd-generator`/`front-ddd-generator` contradice esta regla, se corrige el template.

### IV. Flujo de Agentes Orquestado (NON-NEGOTIABLE)

Todo desarrollo pasa por el pipeline y se cierra en `memory/history_log.json`.

```text
@develop → @speckit-{specify, clarify, plan, tasks, analyze}   (política MacroGest inline)
        → @blendverse-implement → @blendverse-back / @blendverse-front
                                → @blendverse-tester ∥ @blendverse-reviewer
                                → qa-report.sh → cierre + PR a main
Input crudo: @blendverse-analyst → 01_requirements.md → @blendverse-implement
```

- Los agentes Speckit son stock; la política MacroGest vive en `@develop`. Tras `specify upgrade`, ejecutar `@blendverse-orchestrate`.
- Dos fuentes de contexto: `01_requirements.md` (input crudo) o los artefactos Speckit (`spec.md`, `plan.md`, `tasks.md`), consumidos sin transcripción.
- `complexity: simple` saltea clarify y reemplaza analyze por una verificación inline.
- Un fallo de QA, tests o review produce un retry del coder con el feedback combinado; al tercer intento fallido se registra `memory/BLOCKED.md` y se detiene la cadena.
- `task_id`: `TASK-{rama-sanitizada}-YYYYMMDD-N` (vía `resolve-task-id.sh`).

### V. Tests por Regla de Negocio (NON-NEGOTIABLE)

- Tests por regla de negocio real, con datos concretos; sin stubs ni `it.todo`.
- Los genera y ejecuta `@blendverse-tester` tras la implementación (`05_test_log.md`), 0 fallidos.
- La QA (`qa-report.sh`) no crea tests: corre tsc, eslint y `vitest related` sobre los `affected_files`, más la auditoría de estructura.
- No requieren tests: modelos Sequelize, rutas, DI, barrels y schemas de presentación.

### VI. Conventional Commits + Linting Gates (NON-NEGOTIABLE)

- `<type>(<scope>): <subject>`; tipos de `@commitlint/config-conventional`; scope = dominio o área.
- Husky (pre-commit / commit-msg) + lint-staged + commitlint. Prohibido `--no-verify`.
- Sin atribución IA ("Co-Authored-By").

### VII. Aislamiento de Dominios (NON-NEGOTIABLE)

- No se importan repositorios de otros dominios; se usan sus casos de uso vía DI (skill `cross-domain-relations`).
- El server nunca importa de `@app`; el frontend sí importa tipos de `@server` (unidireccional).
- Toda DI con Awilix en `[domain].di.ts`.
- `Application/` global es transversal (datasource, logger, tenancy, helpers); la lógica de negocio no vive ahí.

## Stack y Path Aliases

| Categoría | Stack |
| --------- | ----- |
| Monorepo | pnpm workspaces, TypeScript 6.x estricto |
| Backend | Express 5, tRPC v11, Sequelize v6 (MySQL), Awilix 13, Zod 4, Pino 10 |
| Frontend | React 19, Vite 8, TanStack Query v5, React Router v7, React Hook Form + Zod, Radix UI, Tailwind CSS v4 |
| Calidad | ESLint 10, Prettier 3, Husky 9, lint-staged 16, Commitlint 20 |
| Tests | Vitest 2 (unit + integration), Playwright (E2E) |

Aliases: `@server` → `packages/server/src`, `@app` → `packages/app/src`, `@server/domains/[Domain]`, `@app/domains/[Domain]` → `packages/app/src/Domains/[Domain]/`.

## Fuente de Verdad Operacional

- Esta constitución prevalece sobre cualquier práctica ad-hoc o instrucción desactualizada.
- Operación: `.opencode/` (agents, commands, skills, instructions, scripts). Pipeline y comandos: `AGENTS.md`.
- Memoria de tareas: `memory/{task_id}/` y `memory/history_log.json` (reglas en `.opencode/instructions/memory.instructions.md`). Engram solo espeja estado; si contradice a un archivo, gana el archivo.
- Cualquier referencia a `.github/` (copilot, agents, instructions) es un residuo obsoleto.

## Governance

- Semantic Versioning: MAJOR redefine o elimina un principio; MINOR agrega guía no contradictoria; PATCH aclara sin cambiar significado. Todo cambio actualiza el Sync Impact Report.
- Las enmiendas se inician vía `/speckit.constitution`, con justificación, bump de versión y propagación a los templates (`plan`, `spec`, `tasks`) y a `.opencode/` cuando corresponda.
- Todo PR cumple I–VII; `@blendverse-reviewer` es el guardián final. `@blendverse-arch-fixer` (vía `blendverse-unify-project`) corrige los desvíos que detecta `arch-audit`.
