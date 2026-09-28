---
name: design-tasks
description: Facade de desglose de tareas. Prohíbe test-tasks en el plan y delega en speckit-tasks. Usar en Fase 4.
---

# design-tasks

Adapter de tareas. Lee `design-adapters.mdc`, overlays y delega en Speckit stock.

## Input

- `{feature}` — directorio bajo `specs/`

## Protocolo

### Paso 1 — Pre-condiciones

1. Si existe `.cursor/templates/speckit/tasks-template.md` → leerlo.
2. Verificar `spec.md` y `plan.md`.

### Paso 2 — Delegación

Invocar `speckit-tasks` con:

- Paths a artefactos de diseño
- **Prohibido** incluir tareas cuyo objetivo principal sea escribir o configurar tests automatizados (los tests van en la cadena de `@implement`)
- Tareas por user story con IDs `T001`, `T002`, …
- Paths concretos de `domain_roots` / `source_roots` del profile
- Marcar `[P]` cuando sean paralelizables

### Paso 3 — Post-chequeo

- `tasks.md` existe
- Sin test-tasks como objetivo principal
- Cada tarea con path cuando corresponda

### Paso 4 — Reporte

- Path a `tasks.md`
- Cantidad de stories y tareas
- Confirmación: sin test-tasks planificadas

## Prohibiciones

- No invocar `@implement` ni agentes de testing de la cadena de implementación.
