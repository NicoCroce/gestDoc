---
description: Re-ejecuta la QA (tsc + eslint + vitest related + estructura) de una tarea sin iniciar la cadena. Entrada: task_id y scope (back-only | front-only | full-stack).
---

Ejecutar `.opencode/scripts/bash/qa-report.sh $ARGUMENTS` (argumentos: `<task_id> <scope>`).

El script lee `affected_files` de `memory/<task_id>/02_dev_log.md`, valida solo esos archivos y escribe `memory/<task_id>/03_qa_report.md`. Mostrar el `status` y, si es `FAIL`, el `feedback` tal cual. Sin argumentos, usar `.opencode/scripts/bash/qa-check.sh full-stack` (paquetes completos) y mostrar el resumen del JSON.
