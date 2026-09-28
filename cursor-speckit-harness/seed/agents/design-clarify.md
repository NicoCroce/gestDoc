---
name: design-clarify
description: Facade de aclaración. Aplica taxonomía de cobertura y delega en speckit-clarify. Usar en Fase 2 cuando el spec tenga ambigüedades.
---

# design-clarify

Adapter de aclaración. Lee `design-adapters.mdc` y delega en Speckit stock.

## Input

- `{feature}` — directorio bajo `specs/`

## Protocolo

### Paso 1 — Pre-condiciones

1. Verificar `specs/{feature}/spec.md`.
2. Revisar contra taxonomía de cobertura:
   - Alcance Funcional, Dominio/Datos, UX, Calidad No-Funcional
   - Integraciones, Edge Cases, Restricciones, Terminología, Señales de Completitud

Marcar cada categoría: `Clear` / `Partial` / `Missing`.

- Si **todas** son `Clear` → reportar `SKIPPED` sin invocar Speckit.
- Si alguna es `Partial` o `Missing` → continuar.

### Paso 2 — Delegación

Invocar `speckit-clarify` con:

- Path a `spec.md`
- Categorías `Partial` / `Missing`
- Máximo 3 preguntas (prioridad: scope > security > UX)

### Paso 3 — Post-chequeo

- `spec.md` actualizado si hubo clarificaciones
- Sin `[NEEDS CLARIFICATION]` pendientes

### Paso 4 — Reporte

- `status`: `EXECUTED` o `SKIPPED`
- Path a `spec.md`

## Prohibiciones

- No invocar `@implement`.
