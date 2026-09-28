---
description: >-
  Pipeline de mejora de feature existente. Orquesta adapters design-* → Speckit
  y handoff a @implement. Siempre modo plan.
version: "1.0.0"
---

# Improve Feature — Pipeline de Diseño + Implementación

Orquestador para **mejorar** una feature existente.
Ejecutá fases de diseño vía `@design-*` y transferí a `@implement`.

> **Facade:** No invoques `@speckit-*` ni `/speckit.*` directamente. Ver `.cursor/rules/design-adapters.mdc`.

## Input

Feature: `{{feature}}`

**Siempre en modo plan** — detenerse tras cada fase (1–5) y esperar confirmación.

## Fase 1 — Especificación

Invocar `@design-specify` con la descripción de la mejora.

Si no está relacionada con un dominio existente → preguntar el nombre.

Mostrar detalle del spec para confirmación o iteración antes de avanzar.

Output: `specs/{{feature}}/spec.md`

## Fase 2 — Aclaración (condicional)

- Ambigüedades → `@design-clarify`
- Sin ambigüedades → continuar a Fase 3

Esperar confirmación antes de continuar.

## Fase 3 — Diseño técnico

Invocar `@design-plan`.

Output en `specs/{{feature}}/`:

- `plan.md`
- `data-model.md` (si aplica)
- `contracts/` (si aplica)

Esperar confirmación antes de continuar.

## Fase 4 — Desglose de tareas

Invocar `@design-tasks`.

Output: `specs/{{feature}}/tasks.md` (sin test-tasks)

Esperar confirmación antes de continuar.

## Fase 5 — Análisis de consistencia

Invocar `@design-analyze`.

Output: qué `@design-*` re-ejecutar si es necesario.

Esperar confirmación antes de continuar.

## Fase 6 — Handoff

Presentar resumen de artefactos.

Luego invocar `@implement` con `{{feature}}` explícito:

> La feature a mejorar es `{{feature}}`. Artefactos en `specs/{{feature}}/`. Procedé con `implement_chain` del project-profile de forma autónoma.

## Notas

- **DETENTE** después de cada fase (1–5).
- Fase 6 automática tras aprobación de Fase 5.
- Tras `specify upgrade`, ejecutar `/orchestrate`.
