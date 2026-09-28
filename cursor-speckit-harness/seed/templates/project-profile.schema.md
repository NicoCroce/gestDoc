# Project Profile — Schema

Archivo generado por `/analyze-project` en `.cursor/project-profile.md`.
Los esqueletos del facade leen estos slots; **no hardcodear** paths de producto en los commands fijos.

## Slots obligatorios

| Slot | Descripción | Ejemplo |
|------|-------------|---------|
| `project_name` | Nombre legible del proyecto | `MyApp` |
| `source_roots` | Raíces de código fuente | `src/`, `packages/*/src/` |
| `domain_roots` | Raíces de dominios/módulos (si aplica) | `packages/server/src/domains/`, `packages/app/src/Domains/` |
| `test_roots` | Directorio y convención de tests | `**/*.test.ts`, `tests/` |
| `constitution_path` | Constitución o gobernanza principal | `.specify/memory/constitution.md` |
| `specs_root` | Artefactos de feature Speckit | `specs/` |
| `speckit_agents_prefix` | Prefijo de agents Speckit stock | `speckit-` |
| `design_adapters` | Lista de adapters facade | `design-specify`, `design-clarify`, … |
| `implement_agent` | Agente coordinador de implementación | `implement` |
| `implement_chain` | Cadena de roles post-diseño | `implement → backend → frontend → tester → qa → reviewer` |
| `memory_layout` | Persistencia de tareas (o `none`) | `memory/{task_id}/` o `none` |
| `template_overlays` | Overlays opcionales para Speckit | `.cursor/templates/speckit/` o `none` |
| `has_frontend` | ¿Hay capa UI? | `true` / `false` |
| `has_backend` | ¿Hay capa API/servicios? | `true` / `false` |
| `stack_summary` | Una línea: runtime + framework + testing | `Node 20 + Express + Vitest` |

## Slots opcionales

| Slot | Descripción |
|------|-------------|
| `frontend_design_skill` | Skill para dirección visual (Fase 3.1) | `frontend-design` |
| `progress_skill` | Skill de banners/progreso | `progress-tracker` |
| `persistent_memory` | Sistema de memoria entre sesiones | `engram` / `none` |
| `default_branch` | Rama base para PRs | `main` |
| `agents_entrypoint` | Nombre del agente primario | `develop` |

## Formato del archivo generado

```markdown
---
generated_by: analyze-project
generated_at: YYYY-MM-DD
version: "1.0.0"
---

# Project Profile — {{project_name}}

## Stack
{{stack_summary}}

## Paths
- Source: {{source_roots}}
- Domains: {{domain_roots}}
- Tests: {{test_roots}}
- Specs: {{specs_root}}
- Constitution: {{constitution_path}}

## Pipeline
- Design adapters: @design-specify, @design-clarify, @design-plan, @design-tasks, @design-analyze
- Implement: @{{implement_agent}}
- Chain: {{implement_chain}}
- Memory: {{memory_layout}}

## Overlays
{{template_overlays}}

## Flags
- Frontend: {{has_frontend}}
- Backend: {{has_backend}}
```

## Reglas de fill-in

1. Todo valor debe tener **evidencia** en el repo (manifiesto, árbol de carpetas, docs).
2. Si no hay dominios explícitos → `domain_roots: (inferir desde source_roots)`.
3. Si no hay `memory/` ni equivalente → `memory_layout: none`.
4. `implement_chain` se acorta según stack: API-only sin `frontend`; lib sin `backend`/`frontend` separados.
5. No inventar prefijos de producto (`blendverse`, nombres de empresa).
