---
description: >-
  Pipeline completo de diseño + implementación para feature nueva. Orquesta
  adapters design-* → Speckit y handoff a @implement. Modo: auto | plan.
version: "1.0.0"
---

# Start Feature — Pipeline Completo

Orquestador del pipeline Speckit + implementación del proyecto.
Ejecutá las fases de diseño **vía** `@design-*` (facade sobre Speckit stock)
y transferí el control a `@implement` para la implementación.

> **Facade:** No invoques `@speckit-*` ni `/speckit.*` directamente. Ver `.cursor/rules/design-adapters.mdc` y `.cursor/project-profile.md`.

## Input

- Feature: `{{feature}}`
- Modo: `{{modo}}` (`plan` | `auto`, default `plan`)

| Modo | Comportamiento |
|------|----------------|
| `plan` | Detenerse tras cada fase (1–5); esperar confirmación |
| `auto` | Encadenar 1→5 si pasa Fase 0; checkpoint único antes de Fase 6 |

## Fase 0 — Evaluación de complejidad (solo `modo auto`)

Evaluar si la feature es de **baja complejidad**. Debe cumplir **TODAS**:

- Sigue un patrón existente del proyecto (CRUD, endpoint, módulo existente).
- No introduce integraciones externas nuevas.
- No modifica data-model de entidad existente de forma incompatible.
- Sin ambigüedad material en los requisitos.

- Cumple todas → continuar en `auto`
- Alguna falla o hay duda → informar y pasar a `plan`

## Regla de interacción (Fases 1–5)

- **`plan`**: detenerse al final de cada fase; mostrar artefacto; no avanzar sin 'ok'.
- **`auto`**: encadenar salvo duda material o corrección explícita del usuario.
- **Invariantes**: si no hay dominio existente (ver `domain_roots` en profile), preguntar nombre del dominio.

## Fase 1 — Especificación

Invocar `@design-specify` con la descripción de la feature.

Output: `specs/{{feature}}/spec.md`

Mostrar resumen para confirmación o iteración según el modo.

## Fase 2 — Aclaración (condicional)

Revisar `spec.md` con la taxonomía de cobertura (`design-clarify`).

- Todas `Clear` → **SKIP** Fase 2
- Alguna `Partial`/`Missing` → `@design-clarify`; esperar respuestas del usuario

## Fase 3 — Diseño técnico

### 3.1 — Dirección frontend (condicional)

Si `has_frontend: true` en profile y el spec tiene alcance UI:

- Invocar skill `frontend_design_skill` del profile (si existe)
- Output: `specs/{{feature}}/frontend-design.md`

Si back-only → SKIP 3.1

### 3.2 — Plan técnico

Invocar `@design-plan`.

Output en `specs/{{feature}}/`:

- `plan.md`
- `data-model.md` (si aplica)
- `contracts/` (si aplica)

## Fase 4 — Desglose de tareas

Invocar `@design-tasks`.

Output: `specs/{{feature}}/tasks.md` (sin test-tasks)

## Fase 5 — Análisis de consistencia

Invocar `@design-analyze`.

Output: reporte; si `NEEDS_FIX`, indicar qué `@design-*` re-ejecutar.

## Fase 6 — Handoff a implementación

Presentar resumen:

```
✅ Pipeline de diseño completado:
   - spec.md  → user stories + criterios de aceptación
   - plan.md  → diseño técnico + Constitution Check
   - tasks.md → tareas por user story

📁 Artefactos en: specs/{{feature}}/
```

En `modo plan`: esperar confirmación explícita antes de Fase 6.
En `modo auto`: checkpoint único con confirmación antes de delegar.

Invocar `@implement` (ver `implement_agent` y `implement_chain` en profile):

> La feature es `{{feature}}`. Artefactos en `specs/{{feature}}/`. Procedé con la cadena de implementación definida en project-profile.

## Notas

- Tras `specify upgrade`, ejecutar `/orchestrate`.
- `@speckit-implement` es stock — este pipeline usa `@implement` en Fase 6.
- No invocar `/speckit.*` desde este pipeline; usar `@design-*`.
