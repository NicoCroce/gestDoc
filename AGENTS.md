# MacroGest Core — Project Context

Monorepo TypeScript con pnpm workspaces. Arquitectura Modular Monolith con DDD y Hexagonal.

## Estructura

- `packages/server` — Backend: Express 5, tRPC v11, Sequelize v6 (MySQL), Awilix DI. Dominios en `src/domains/[Domain]/` con capas Domain/Application/Infrastructure/Presentation/DI.
- `packages/app` — Frontend: React 19, Vite, TanStack Query, React Router, Tailwind. Dominios en `src/Domains/[Domain]/`.
- `specs/` — Artefactos Speckit por feature (`{spec,plan,tasks}.md`).
- `memory/` — Artefactos del pipeline de agentes por tarea.

## Comandos

| Comando           | Uso                                  |
| ----------------- | ------------------------------------ |
| `pnpm app:dev`    | Frontend en dev (Vite)               |
| `pnpm server:dev` | Backend en dev (tsx watch)           |
| `pnpm test`       | Tests de todos los packages (Vitest) |
| `pnpm lint`       | ESLint sobre server y app            |
| `pnpm tsc`        | TypeScript check sin emit            |
| `pnpm build`      | Build de server y app                |

## Fuente de Verdad

- `.specify/memory/constitution.md` — principios de arquitectura (I–VII). Prevalece sobre prácticas ad-hoc.
- `.opencode/instructions/server.instructions.md` — reglas normativas del backend.
- `.opencode/instructions/app.instructions.md` — reglas normativas del frontend.
- `.opencode/instructions/memory.instructions.md` — reglas de persistencia de memoria.
- Las instrucciones **no** se cargan globalmente: cada agente lee solo las de su paquete (back → server, front → app, tester/reviewer → según scope).

## Pipeline de agentes (OpenCode)

```text
@develop ──► @speckit-{specify,clarify,plan,tasks,analyze}   (política MacroGest inline en el prompt)
        └─► @blendverse-implement ──► @blendverse-back / @blendverse-front
                                   ──► @blendverse-tester ∥ @blendverse-reviewer
                                   ──► qa-report.sh (tsc + eslint + vitest related + estructura)
                                   ──► cierre en memory/history_log.json + PR a main
```

- `complexity: simple` saltea clarify y analyze (verificación inline).
- Un fallo de QA, tests o review → un solo retry del coder con el feedback combinado; 3 intentos → `memory/BLOCKED.md`.
- Input crudo sin Speckit: `blendverse-start-task` (`@blendverse-analyst` → `@blendverse-implement`).
- Modelo por agente (opcional; sin definir, cada agente usa el modelo seleccionado). Se configura en `opencode.json` para no editar los agentes `speckit-*` stock, por ejemplo: `"agent": { "develop": { "model": "<provider/rápido>" }, "speckit-plan": { "model": "<provider/fuerte>" } }`. Sugerido: rápido para `develop`, `blendverse-implement`, `speckit-{specify,clarify,tasks,analyze}`; fuerte para `speckit-plan`, `blendverse-{back,front,tester,reviewer}`.
- Scripts en `.opencode/scripts/bash/`: `qa-report.sh`, `qa-check.sh`, `checkpoint.sh`, `resolve-task-id.sh`, `breakloop-check.sh`, `memory-log-scaffold.sh`, `audit-arch.sh`, `open-pr.sh`, `run-timeout.sh`, `jev-gate.sh`.
- Jev (TypeSafe) en modo sombra: `@develop` llama a `jev-gate.sh` en sus gates y registra la respuesta junto a la decisión del pipeline en `memory/jev-decisions.jsonl`, sin cambiar el flujo. Requiere `TYPESAFE_API_KEY` en el entorno (sin ella, `skipped`). `jev-gate.sh report` resume el acuerdo por gate.
- Anti-cuelgues: todo comando largo de un agente (vitest, tsc, git remoto) pasa por `run-timeout.sh` o por un script con timeout propio (exit 124 = timeout, se informa); `open-pr.sh` no admite prompts de credenciales; cada subagente tiene `steps` (Blendverse en su frontmatter, `speckit-*` en `opencode.json`).

### Modelos por agente (opcional)

Sin configuración, todos los agentes usan el modelo seleccionado. Para asignar modelos, agregar overrides en `opencode.json` (no toca los archivos stock de Speckit):

```json
"agent": {
  "develop": { "model": "<rapido>" },
  "blendverse-implement": { "model": "<rapido>" },
  "speckit-specify": { "model": "<rapido>" },
  "speckit-clarify": { "model": "<rapido>" },
  "speckit-tasks": { "model": "<rapido>" },
  "speckit-analyze": { "model": "<rapido>" },
  "speckit-plan": { "model": "<fuerte>" },
  "blendverse-back": { "model": "<fuerte>" },
  "blendverse-front": { "model": "<fuerte>" },
  "blendverse-tester": { "model": "<fuerte>" },
  "blendverse-reviewer": { "model": "<fuerte>" }
}
```

Formato de ID: `provider/modelo` (ver `opencode models`). Omitir cualquier entrada para que ese agente herede el modelo seleccionado.

## Convenciones

- Commits: Conventional Commits (`<type>(<scope>): <subject>`), sin atribución IA, nunca `--no-verify`.
- Dentro de `packages/server/src/Infrastructure/**` y en los `*.model.ts`, importar submódulos concretos (`@server/Infrastructure/Database`, `.../utils/pino`), nunca el barrel `@server/Infrastructure`: crea ciclos que cuelgan los specs que mockean ese barrel.
- **Post-install Speckit:** `@blendverse-orchestrate` verifica la vinculación sin modificar archivos stock.
- No editar `.opencode/commands/speckit.*` ni `.opencode/agents/speckit-*`; tras `specify upgrade`, re-ejecutar `@blendverse-orchestrate`.

<!-- SPECKIT START -->

## Spec Kit — Feature Plan

Active feature: **exclude-terms-pending-no-text**

- Spec: `specs/008-exclude-terms-pending-no-text/spec.md`
- Plan: `specs/008-exclude-terms-pending-no-text/plan.md`
- Branch: `008-exclude-terms-pending-no-text`

<!-- SPECKIT END -->
