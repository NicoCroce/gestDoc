---
description: >-
  Verifica la vinculación Speckit (stock) + OpenCode + Blendverse. Ejecutar tras
  `specify init` o `specify upgrade`. No modifica archivos stock.
---

# Blendverse Orchestrate

## Capas

| Zona | Paths | ¿La regenera `specify upgrade`? |
| ---- | ----- | ------------------------------- |
| Speckit stock | `.opencode/commands/speckit.*`, `.opencode/agents/speckit-*`, `.specify/scripts/`, `.specify/templates/` | Sí — no editar con lógica Blendverse |
| Blendverse | `.opencode/agents/{develop,blendverse-*}.md`, `.opencode/commands/blendverse-*`, `.opencode/skills/`, `.opencode/instructions/`, `.opencode/scripts/` | No |
| Overlays MacroGest | `.opencode/templates/speckit/` | No |

La política MacroGest de cada fase de diseño vive en el sufijo de prompt de `@develop`; los agentes Speckit no se tocan.

## Checklist (reportar PASS/FAIL por ítem)

1. **Speckit instalado**: `.specify/integration.json` con `"integration": "opencode"`; existen los agentes que usa `@develop`: `speckit-specify`, `speckit-clarify`, `speckit-plan`, `speckit-tasks`, `speckit-analyze`.
2. **Speckit sin contaminación**: `grep -l -i "blendverse\|@develop" .opencode/commands/speckit.* .opencode/agents/speckit-*` vacío; `speckit-implement` es stock.
3. **OpenCode**: `opencode.json` **sin** `instructions` globales (cada agente lee lo suyo); `AGENTS.md` con marcadores `<!-- SPECKIT START -->` / `<!-- SPECKIT END -->`.
4. **agent-context**: `.specify/extensions/agent-context/agent-context-config.yml` con `context_file: AGENTS.md`.
5. **Hooks**: en `.specify/extensions.yml` solo `before_constitution` y `before_specify` (creación de rama) con `enabled: true`.
6. **Overlays**: existen `.opencode/templates/speckit/plan-template.md` y `tasks-template.md` (referenciados por `@develop`).
7. **Implementación**: existen `blendverse-implement`, `blendverse-{back,front,tester,reviewer}` y los scripts `qa-report.sh`, `qa-check.sh`, `checkpoint.sh`, `resolve-task-id.sh`, `open-pr.sh`, `run-timeout.sh` (ejecutables); `steps` definido en los subagentes `blendverse-*` y en `opencode.json` para los `speckit-*`.
8. **Tests del server sin cuelgues**: `cd packages/server && ../../.opencode/scripts/bash/run-timeout.sh 120 npx vitest run` termina; `pnpm lint` no reporta `no-restricted-imports` (regla que prohíbe el barrel `@server/Infrastructure` en modelos e `Infrastructure/**`).

## Flujo diario

```text
@develop → @speckit-{specify,clarify,plan,tasks,analyze} (política inline)
        → @blendverse-implement → back/front → tester ∥ reviewer → qa-report.sh → PR
```

`/speckit.*` queda para uso manual o diagnóstico.

## Tras `specify upgrade`

Restaurar stock si algún `speckit.*` quedó con referencias Blendverse y re-ejecutar este checklist. Si cambió el nombre de un agente Speckit, actualizar las Fases de `develop.md`.
