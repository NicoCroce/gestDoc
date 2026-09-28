---
description: Flujo para tareas sin artefactos Speckit (input crudo). @blendverse-analyst genera 01_requirements.md y @blendverse-implement ejecuta la cadena hasta el PR. Para features con diseño Speckit usar @develop.
---

1. `task_id=$(.opencode/scripts/bash/resolve-task-id.sh resolve "$(git branch --show-current)" "<título en una línea>")`.
2. `task` → `@blendverse-analyst`:
   > task_id `{task_id}`. Requerimiento: $ARGUMENTS. Seguir la skill `requirements-analyst` y escribir `memory/{task_id}/01_requirements.md`.
3. Cuando el usuario apruebe los requerimientos, `task` → `@blendverse-implement`:
   > task_id `{task_id}`. Contexto: `memory/{task_id}/01_requirements.md`.

Informar: `Tarea {task_id}: analyst → coder(s) → tester ∥ reviewer → QA (script) → cierre y PR`.
