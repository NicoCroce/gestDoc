---
name: engram-sync
description: Qué estado de los pipelines se espeja en Engram y cuándo. Los archivos en disco son siempre la fuente de verdad; Engram solo sirve para detectar y reanudar trabajo entre sesiones.
---

# Engram Sync

Todos los espejos: `scope: project`, `capture_prompt: false`, título breve, `topic_key` y `status` explícitos. Si el espejo contradice al archivo, gana el archivo y se corrige el espejo con el mismo `topic_key`.

## Diseño (`@develop`)

Un único espejo `feature/{feature_key}/pipeline`, guardado solo en el pre-flight y al pasar a `HANDOFF`:

```text
topic_key: feature/<feature_key>/pipeline
status: IN_PROGRESS | HANDOFF
next_phase: <1..6>
feature_key / feature_dir / branch / mode / complexity
summary: <una línea>
```

Recuperar con `mem_search("pipeline <feature_key>")` y verificar en disco los artefactos de las fases previas.

## Implementación (`@blendverse-implement`)

La reanudación usa `memory/{task_id}/.checkpoint.json` (`checkpoint.sh get`). Engram guarda un solo espejo, `task/{task_id}/status`, al cerrar (`COMPLETED` + `pr_url`) o al bloquear (`BLOCKED`). Los workers no escriben en Engram.
