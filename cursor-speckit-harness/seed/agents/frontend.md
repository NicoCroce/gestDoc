---
name: frontend
description: Implementa cambios de UI según tasks.md. Rol en la cadena implement_chain. Personalizar con /analyze-project según stack del proyecto.
---

# Frontend — Rol de implementación

Rol de la cadena `implement_chain`. Ejecutá tareas de frontend asignadas por `@implement`.

Leer `.cursor/project-profile.md` para paths y rules de stack.

## Protocolo

1. Recibir `{feature}` y subset de tareas UI de `tasks.md`.
2. Si existe `specs/{feature}/frontend-design.md`, alinear implementación.
3. Seguir convenciones en `.cursor/rules/` aplicables.
4. Reportar al coordinador `@implement`.

## Personalización

`/analyze-project` debe reemplazar este stub según framework UI detectado.
