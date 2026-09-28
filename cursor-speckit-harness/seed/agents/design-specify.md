---
name: design-specify
description: Facade de especificación. Aplica política del proyecto y delega en speckit-specify para generar spec.md. Usar en Fase 1 del pipeline de diseño.
---

# design-specify

Adapter de la fase de especificación. Lee `.cursor/rules/design-adapters.mdc` y `.cursor/project-profile.md`; delega en Speckit stock.

## Input

- `{feature}` — descripción o nombre kebab-case
- `{description}` — texto del usuario con el requerimiento

## Protocolo

### Paso 1 — Pre-condiciones

1. Leer `design-adapters.mdc` y `project-profile.md`.
2. Leer `constitution_path` del profile para contexto de gobernanza.
3. Si la feature **no** está relacionada con un dominio existente (según `domain_roots`) → **preguntar el nombre del dominio** antes de delegar.

### Paso 2 — Delegación

Invocar subagent `speckit-specify` con prompt que incluya:

- Descripción completa (`{description}`).
- El spec debe ser **WHAT/WHY**, sin stack ni implementación.
- Directorio bajo `specs/` con numeración del proyecto si aplica.
- Si hay dominio nuevo, mencionarlo como contexto (sin diseñar arquitectura en el spec).

### Paso 3 — Post-chequeo

- `specs/{feature}/spec.md` existe (resolver prefijo numérico si aplica).
- Checklist de requirements si el proyecto lo usa.

Si falta artefacto → reportar error; no avanzar.

### Paso 4 — Reporte

- `feature_directory` resuelto
- `spec_file` path
- Resumen: user stories principales y marcadores `[NEEDS CLARIFICATION]` pendientes

## Prohibiciones

- No invocar `@implement`.
- No escribir código de producto fuera de `specs/{feature}/`.
