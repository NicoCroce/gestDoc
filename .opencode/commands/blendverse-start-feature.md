---
description: Orquesta el diseño Speckit y entrega una feature validada a Blendverse para implementación DDD. Entrada: feature y modo opcional `plan` o `auto`.
---

# Start Feature

Orquestá el diseño de una feature con Speckit y entregala a `@blendverse-implement`.

## Entrada

- `feature_key`: identificador lógico kebab-case derivado del pedido y usado en Engram.
- `mode`: `plan` o `auto`; por defecto `plan`.

`feature_key` nunca se usa como ruta. Tras Fase 1, resolver `feature_dir` desde
`.specify/feature.json`; es la única ruta de artefactos para el resto del flujo.

## Fuentes de verdad

1. Cargar una vez `progress-tracker` y `engram-sync` al inicio. Aplicar sus contratos sin recargarlas en cada fase.
2. Los artefactos en `feature_dir` son la fuente de verdad. Engram solo permite detectar y reanudar estado.
3. Cada agente Speckit gestiona sus propios hooks de `.specify/extensions.yml`. No duplicar esa lógica ni anticipar sus prompts opcionales.
4. `@blendverse-implement` es dueño de implementación, checkpoints, QA, review, cierre y PR. Este comando solo inicia el handoff.

## Estado del pipeline

El único espejo del diseño es `feature/<feature_key>/pipeline`. Guardarlo en el
pre-flight y después de cada fase aprobada o salteada, con `capture_prompt: false`:

```text
status: IN_PROGRESS | HANDOFF
next_phase: 1..6
approved_phases: [1, ...]
feature_key: <valor real>
feature_dir: <ruta real o pending>
branch: <rama efectiva o pending>
mode: plan | auto
artifacts: <rutas existentes relevantes>
summary: <resultado breve de la última fase>
```

Usar la misma `topic_key` para actualizar el registro. No crear espejos separados
para spec, clarify, plan, tasks o consistency.

## Pre-flight

1. Buscar `feature/<feature_key>/pipeline` siguiendo `engram-sync`.
2. Si está `IN_PROGRESS`, pedir una única decisión: reanudar desde `next_phase` o empezar de cero. Al reanudar, verificar en disco los artefactos requeridos por las fases aprobadas; si falta alguno, retroceder a su fase productora y actualizar el espejo.
3. Si está `HANDOFF`, informar que la implementación ya fue delegada y detenerse.
4. Si no hay pipeline, crear el registro inicial con `next_phase: 1`, `feature_dir: pending` y `branch: pending`.
5. Crear la todo list definida por `progress-tracker`. En `mode: plan`, Fase 0 debe iniciar `completed` con nota `SKIPPED — solo se evalúa en modo auto`.

## Política común

### Modo

- `plan`: al terminar cada Fase 1–5, presentar un resumen breve y esperar aprobación explícita antes de persistir la fase y avanzar.
- `auto`: encadenar Fases 1–5. Cambiar a `plan` solo ante una duda material, un cambio crítico o hallazgos `CRITICAL`/`HIGH` del análisis.
- Duda material: decisión que cambia alcance, permisos, modelo de datos, integración externa o flujo UX esencial. Si hace falta crear un dominio y su nombre no se deduce inequívocamente del requerimiento, preguntarlo.

### Gate de cambios

Aplica solo a Fases 1–4 cuando el artefacto destino ya existe. Antes de invocar la fase, tomar un snapshot en disco. Después, obtener un diff acotado a archivos, encabezados y líneas modificadas; no retener archivos completos en contexto.

- `CRÍTICO`: modifica/elimina regla de negocio, criterio de aceptación, validación, modelo de datos existente o contrato. Mostrar el cambio y su motivo, pasar a `plan` y requerir aprobación.
- `MENOR`: formato, redacción, orden o adición sin alterar comportamiento. Mostrar una lista breve y continuar en `auto`; en `plan` queda cubierto por la aprobación de fase.
- Sin diff: continuar.

Fase 5 es read-only y no usa este gate. Tras cualquier fase, verificar que sus artefactos requeridos existen y no están vacíos antes de actualizar el estado.

## Fases

Usar la visibilidad y la todo list de `progress-tracker`; reportar solo transiciones y decisiones relevantes.

| Fase | Acción                                                                                                                                                                                     | Artefactos requeridos                                                                                 | Regla de finalización                                                                                                                                                      |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0    | Solo en `auto`: evaluar si sigue un patrón existente, no agrega integraciones ni relaciones cross-domain, no modifica modelo existente y no tiene ambigüedades.                            | Ninguno                                                                                               | Si alguna condición falla, cambiar a `plan`; si pasa, continuar en `auto`. No cuenta para progreso.                                                                        |
| 1    | Invocar `@speckit-specify` con la descripción de la feature.                                                                                                                               | `feature_dir/spec.md`                                                                                 | Resolver `feature_dir` desde `.specify/feature.json` y la rama efectiva desde Git antes de persistir.                                                                      |
| 2    | Invocar siempre `@speckit-clarify`; es el evaluador canónico de ambigüedad.                                                                                                                | `feature_dir/spec.md`                                                                                 | Si no formula preguntas materiales, marcar `SKIPPED — sin aclaraciones necesarias`. Si formula preguntas, cambiar a `plan`, esperar respuestas y completar al resolverlas. |
| 3    | Detectar alcance UI desde `spec.md`. Si existe, cargar `frontend-design` y escribir `feature_dir/frontend-design.md`; luego invocar `@speckit-plan`, indicándole leer ese brief si existe. | `plan.md`; y los que el plan produzca (`research.md`, `data-model.md`, `contracts/`, `quickstart.md`) | Back-only: diseño frontend `SKIPPED`; sigue siendo parte de Fase 3 y no altera el porcentaje.                                                                              |
| 4    | Invocar `@speckit-tasks`.                                                                                                                                                                  | `feature_dir/tasks.md`                                                                                | Verificar que contenga tareas identificables antes de avanzar.                                                                                                             |
| 5    | Invocar `@speckit-analyze`.                                                                                                                                                                | `spec.md`, `plan.md`, `tasks.md`                                                                      | `CRITICAL`/`HIGH`: cambiar a `plan`, indicar la fase responsable y corregirla. `MEDIUM`/`LOW`: registrar en el resumen y continuar en `auto`.                              |

Después de cada resultado aprobado o salteado, actualizar el único espejo de pipeline con la próxima fase, rama efectiva, `feature_dir`, artefactos existentes y un resumen conciso.

## Fase 6: Handoff

1. Generar desde `feature_dir` un resumen de los artefactos que existen realmente.
2. En `auto`, pedir el checkpoint único: delegar o iterar sobre un artefacto. Si se itera, cambiar a `plan` y volver a la fase productora. En `plan`, las fases ya fueron aprobadas y se delega directamente.
3. Actualizar el espejo a `status: HANDOFF`, `next_phase: 6` y registrar el inventario de artefactos.
4. Invocar `@blendverse-implement` con este contrato mínimo:

   ```text
   feature_key: <feature_key>
   feature_dir: <feature_dir>
   branch: <rama efectiva>
   spec: <feature_dir>/spec.md
   plan: <feature_dir>/plan.md
   tasks: <feature_dir>/tasks.md
   frontend_design: <feature_dir>/frontend-design.md | absent
   ```

5. Marcar el ítem de handoff como completado solo cuando la delegación fue aceptada. Informar `HANDOFF STARTED`; no informar 100% ni `COMPLETED`, porque ese estado corresponde a `@blendverse-implement` tras QA, review y PR.

## Límites

- Si una fase supera cinco minutos, informar el retraso y diagnosticarlo antes de continuar.
- Si el usuario ya tiene `spec.md`, `plan.md` y `tasks.md` válidos, puede invocar `@blendverse-implement` directamente con `feature_key` y `feature_dir`.
