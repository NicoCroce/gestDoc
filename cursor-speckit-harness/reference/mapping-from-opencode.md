# Mapping — OpenCode (gestDoc) → Cursor Harness

Referencia para quien migra desde un harness OpenCode/Blendverse al kit portable Cursor.

## Entrypoints

| OpenCode (gestDoc) | Cursor kit |
|--------------------|------------|
| `@develop` | `@develop` |
| `blendverse-start-feature` | `/start-feature` |
| `blendverse-improve-feature` | `/improve-feature` |
| `@blendverse-orchestrate` | `/orchestrate` |
| — | `/analyze-project` (nuevo — bootstrap Cursor) |
| — | `/audit-improvements` (auditoría código) |

## Agents — Facade diseño

| OpenCode | Cursor kit |
|----------|------------|
| `blendverse-design-specify` | `design-specify` |
| `blendverse-design-clarify` | `design-clarify` |
| `blendverse-design-plan` | `design-plan` |
| `blendverse-design-tasks` | `design-tasks` |
| `blendverse-design-analyze` | `design-analyze` |
| `speckit-*` (stock) | `speckit-*` (stock — sin cambio) |

## Agents — Implementación

| OpenCode (MacroGest) | Cursor kit (genérico) |
|----------------------|----------------------|
| `blendverse-implement` | `implement` |
| `blendverse-back` | `backend` |
| `blendverse-front` | `frontend` |
| `blendverse-tester` | `tester` |
| `blendverse-qa` | `qa` |
| `blendverse-reviewer` | `reviewer` |

La cadena exacta se define en `project-profile.md` tras `/analyze-project`.

## Instructions → Rules

| OpenCode | Cursor |
|----------|--------|
| `.opencode/instructions/design-adapters.instructions.md` | `.cursor/rules/design-adapters.mdc` |
| `.opencode/instructions/server.instructions.md` | `.cursor/rules/server.mdc` (generada) |
| `.opencode/instructions/app.instructions.md` | `.cursor/rules/app.mdc` (generada) |
| `.opencode/instructions/memory.instructions.md` | rule o skill según `memory_layout` |

OpenCode carga instructions vía `opencode.json`. Cursor usa rules con `globs` / `alwaysApply`.

## Commands

| OpenCode | Cursor |
|----------|--------|
| `.opencode/commands/blendverse-start-feature.md` | `.cursor/commands/start-feature.md` |
| `.opencode/commands/blendverse-improve-feature.md` | `.cursor/commands/improve-feature.md` |
| `.opencode/commands/blendverse-orchestrate.md` | `.cursor/commands/orchestrate.md` |

## Templates / Overlays

| OpenCode | Cursor |
|----------|--------|
| `.opencode/templates/speckit/plan-template.md` | `.cursor/templates/speckit/plan-template.md` |
| `.opencode/templates/speckit/tasks-template.md` | `.cursor/templates/speckit/tasks-template.md` |
| `.specify/templates/*` (stock) | `.specify/templates/*` (stock — no tocar) |

## Skills

| OpenCode (MacroGest) | Cursor kit |
|----------------------|------------|
| `engram-sync` | opcional — solo si `persistent_memory: engram` en profile |
| `progress-tracker` | opcional — skill generada o omitida |
| `back-ddd-generator` | **no en v1** — generar equivalente en analyze si el stack lo requiere |
| `front-ddd-generator` | idem |
| `frontend-design` | `frontend_design_skill` en profile |

## Persistencia

| OpenCode (gestDoc) | Cursor kit v1 |
|--------------------|---------------|
| `memory/{task_id}/` | `memory_layout` en profile — generar si existe equivalente |
| Engram `feature/{feature}/pipeline` | opcional — no obligatorio en v1 |
| `memory/history_log.json` | opcional — documentar en profile si aplica |

## Frontmatter — diferencias de formato

### OpenCode agent

```yaml
---
description: ...
mode: primary | subagent
permission:
  read: allow
  edit: allow
---
```

### Cursor agent

```yaml
---
name: kebab-case
description: ...
---
```

### OpenCode instruction

```yaml
---
description: ...
applyTo: 'path/glob'
---
```

### Cursor rule

```yaml
---
description: ...
globs: **/*.ts
alwaysApply: false
---
```

## Criterios de fill-in (`/analyze-project`)

| Slot | Fuente en gestDoc | Cómo detectar en proyecto genérico |
|------|-------------------|--------------------------------------|
| `domain_roots` | `packages/server/src/domains/`, `packages/app/src/Domains/` | Glob de módulos/dominios |
| `constitution_path` | `.specify/memory/constitution.md` | Buscar constitution / ARCHITECTURE |
| `implement_chain` | `back → front → tester → qa → reviewer` | Inferir de capas presentes |
| `has_frontend` | React en `packages/app` | Manifiesto + árbol UI |
| `has_backend` | Express en `packages/server` | Manifiesto + entrypoint API |
| `memory_layout` | `memory/{task_id}/` | Glob `memory/**` |

## Qué NO mapear literalmente

- Prefijos `blendverse-*` — usar nombres genéricos
- `MacroGest Core`, `Awilix`, `tRPC`, `Sequelize` — solo si el proyecto los tiene
- Permisos OpenCode (`permission:`) — Cursor usa modelo distinto
- `opencode.json` — no aplica; Cursor lee `.cursor/` directamente

## Instalación Speckit

| gestDoc | Cursor kit |
|---------|------------|
| `specify init --here --integration opencode` | `specify init --here --integration cursor` |

Si la integración `cursor` no está disponible en la versión del CLI, usar la integración soportada y documentar paths de agents Speckit en `project-profile.md`.
