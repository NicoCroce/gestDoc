---
name: engram-sync
description: Espeja el estado de los pipelines Speckit y Blendverse en Engram para reanudar trabajo interrumpido. Usar en el inicio/cierre de cada pipeline y al cerrar artefactos de agentes.
---

# Engram Sync

Los archivos en disco son la fuente de verdad. Engram solo indexa estado para
recuperación. Antes de reanudar, verificar el archivo indicado; si contradice el
espejo, actualizar el espejo con el mismo `topic_key`.

Todos los espejos usan `scope: project`, `capture_prompt: false`, un título breve y
contenido con `topic_key` y `status` explícitos.

## Pipeline de diseño

Usar exclusivamente `feature/{feature_key}/pipeline`. Guardar en pre-flight y tras
cada fase aprobada, salteada o handoff:

```text
**What**: Pipeline de <feature_key> en <status>.
**Why**: <resultado de la última fase>.
**Where**: <feature_dir o pending>.
**Learned**: <decisión o riesgo material, si existe>.

topic_key: feature/<feature_key>/pipeline
status: IN_PROGRESS | HANDOFF
next_phase: <1..6>
approved_phases: [<n>]
feature_key: <feature_key>
feature_dir: <ruta real o pending>
branch: <rama efectiva o pending>
mode: plan | auto
artifacts: <lista breve de rutas existentes>
```

Para recuperar, buscar `pipeline {feature_key}`. Si existe `IN_PROGRESS`, leer
`next_phase` y verificar los artefactos de `approved_phases`. Si falta alguno,
retroceder a la fase que lo produce. Si está `HANDOFF`, no volver a delegar.

## Cadena de implementación

Mantener los topic keys por tarea porque representan artefactos independientes:

```text
task/{task_id}/registration
task/{task_id}/dev-log
task/{task_id}/test-log
task/{task_id}/qa-report
task/{task_id}/review-log
task/{task_id}/status
```

El checkpoint en `memory/{task_id}/.checkpoint.json` es la fuente primaria de
reanudación. Si falta, usar los archivos de `memory/{task_id}/` y solo después el
espejo Engram. Los workers guardan su espejo inmediatamente después de escribir su
artefacto definitivo; el orquestador guarda `registration` y `status`.
