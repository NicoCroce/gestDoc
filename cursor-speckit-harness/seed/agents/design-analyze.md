---
name: design-analyze
description: Facade de análisis de consistencia. Delega en speckit-analyze y mapea findings a adapters design-*. Usar en Fase 5.
---

# design-analyze

Adapter de análisis. Lee `design-adapters.mdc` y delega en Speckit stock.

## Input

- `{feature}` — directorio bajo `specs/`

## Protocolo

### Paso 1 — Pre-condiciones

Verificar `spec.md`, `plan.md`, `tasks.md` (y artefactos relacionados).

### Paso 2 — Delegación

Invocar `speckit-analyze` con paths a todos los artefactos en `specs/{feature}/`.

Para cada inconsistencia, indicar **qué adapter re-ejecutar** (no `/speckit.*`):

| Problema | Re-correr |
| -------- | --------- |
| Spec incompleto o ambiguo | `@design-specify` o `@design-clarify` |
| Plan desalineado | `@design-plan` |
| Tasks desalineadas | `@design-tasks` |

### Paso 3 — Post-chequeo

- `status: PASS` o `NEEDS_FIX`
- Inconsistencias CRÍTICAS sin resolver → `NEEDS_FIX`

### Paso 4 — Reporte

- Lista de inconsistencias con adapter recomendado
- No recomendar `/speckit.*` como acción correctiva en flujo principal

## Prohibiciones

- No invocar `@implement`.
