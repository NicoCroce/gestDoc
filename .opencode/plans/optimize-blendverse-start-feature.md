# Plan: Optimizar `blendverse-start-feature` y eliminar `speckit-to-blendverse`

**Fecha**: 2026-09-05
**Estado**: APROBADO por el usuario (Nivel 1 + 2.2), pendiente de ejecución
**Motivación**: La feature 007 (exclude-deleted-users-emails) tardó ~22 min en diseño
(5 fases Speckit + handoff). De esas, ~7 min fueron overhead eliminable para features
simples (clarify que no encontró nada, analyze con subagente completo cuando alcanzaba
una verificación sintáctica, artefactos que nadie leyó).

## Alcance aprobado

- **Nivel 1.1**: Eliminar `.opencode/commands/speckit-to-blendverse.md` (código muerto
  declarado en su propio header).
- **Nivel 1.2**: Agregar `complexity: simple|standard` a la Fase 0 de
  `blendverse-start-feature.md`, con skips condicionales en Fases 2 y 5.
- **Nivel 1.3**: Fase 3 genera menos artefactos cuando `complexity=simple`.
- **Nivel 1.4**: Deshabilitar hooks opcionales de git/agent-context en
  `.specify/extensions.yml` (`enabled: true` → `enabled: false`).
- **Nivel 2.2**: Reducir espejos Engram de 7 a 2 (pre-flight + handoff) en
  `blendverse-start-feature.md`.

**Fuera de scope (no se toca):** los agentes `speckit-*.md` (son del framework
Speckit, modificarlos ata al equipo a mantener un fork), la cadena de implementación
(`blendverse-implement` → back/front/tester/qa/reviewer), el Cambio A ya aplicado
al Tester (vitest acotado).

## Edits detallados

### Edit 1 — Eliminar `.opencode/commands/speckit-to-blendverse.md`

`rm .opencode/commands/speckit-to-blendverse.md`

Verificación previa ya hecha: el propio archivo declara en su línea 7 que no se usa
en el pipeline activo. `grep -r "speckit-to-blendverse"` en `.opencode/` solo encuentra
referencias dentro del propio archivo.

### Edit 2 — `.opencode/commands/blendverse-start-feature.md`

#### 2a. Agregar `complexity` a la sección Entrada

Después de la línea 12 (`mode: plan o auto...`), agregar:

```markdown
- `complexity`: `simple` o `standard`; por defecto `standard`. En `auto`, la Fase 0
  lo infiere; en `plan`, se le pregunta al usuario si no está claro.
  - `simple`: fix/ajuste puntual en 1-2 archivos conocidos, sin modelo de datos
    nuevo, sin UX nueva, sin integraciones externas, sin ambigüedad de alcance.
  - `standard`: todo lo demás.
```

#### 2b. Reescribir la Fase 0 en la tabla de Fases

Reemplazar la fila de la Fase 0 (línea 76) por:

```markdown
| 0 | Solo en `auto`: evaluar (a) si sigue un patrón existente, no agrega
integraciones ni relaciones cross-domain, no modifica modelo existente y
no tiene ambigüedades; y (b) si la complejidad es `simple` (fix puntual
en archivos conocidos, sin modelo nuevo, sin UX, sin integraciones).
Persistir `complexity` en el espejo Engram. | Ninguno | Si (a) falla, cambiar a `plan`; si pasa, continuar en `auto`. Si (b) determina `simple`, aplicar los skips de Fases 2 y 5. No cuenta para progreso. |
```

#### 2c. Reescribir la fila de la Fase 2 (clarify) para skip condicional

Reemplazar la fila de la Fase 2 (línea 78) por:

```markdown
| 2 | Si `complexity=simple`: marcar `SKIPPED — feature simple, pedido sin
         ambigüedad` y continuar. Si `complexity=standard`: invocar siempre
`@speckit-clarify`; es el evaluador canónico de ambigüedad. | `feature_dir/spec.md` | Si no formula preguntas materiales, marcar `SKIPPED — sin aclaraciones necesarias`. Si formula preguntas, cambiar a `plan`, esperar respuestas y completar al resolverlas. |
```

#### 2d. Reescribir la fila de la Fase 3 (plan) para menos artefactos en simple

Reemplazar la fila de la Fase 3 (línea 79) por:

```markdown
| 3 | Detectar alcance UI desde `spec.md`. Si existe, cargar `frontend-design`
y escribir `feature_dir/frontend-design.md`; luego invocar `@speckit-plan`,
indicándole leer ese brief si existe. Si `complexity=simple`, indicarle
además: "generar solo `plan.md` y `research.md`; omitir `data-model.md`,
`contracts/`, `quickstart.md`". | `plan.md`; en `standard` además los que el plan produzca (`research.md`, `data-model.md`, `contracts/`, `quickstart.md`); en `simple` solo `plan.md` + `research.md` | Back-only: diseño frontend `SKIPPED`; sigue siendo parte de Fase 3 y no altera el porcentaje. |
```

#### 2e. Reescribir la fila de la Fase 5 (analyze) para verificación inline en simple

Reemplazar la fila de la Fase 5 (línea 81) por:

```markdown
| 5 | Si `complexity=simple`: verificación inline sin subagente — leer `tasks.md`
y confirmar que (a) cada tarea tiene un ID único y archivo de destino
explícito, (b) cada FR de `spec.md` aparece referenciado en al menos una
tarea. Si ambas pasan, registrar "analyze inline OK" y continuar; si alguna
falla, escalar a `@speckit-analyze` completo. Si `complexity=standard`:
invocar `@speckit-analyze` como hoy. | `spec.md`, `plan.md`, `tasks.md` | `standard`: `CRITICAL`/`HIGH` → cambiar a `plan`, indicar la fase responsable y corregirla; `MEDIUM`/`LOW` → registrar y continuar en `auto`. `simple`: falla de verificación inline → invocar `@speckit-analyze`. |
```

#### 2f. Reducir los espejos Engram (Nivel 2.2)

En la sección "Estado del pipeline" (líneas 24-42), reemplazar el párrafo
"Guardarlo en el pre-flight y después de cada fase aprobada o salteada" por:

```markdown
Guardarlo **solo en dos momentos**: (1) en el pre-flight, al crear o retomar el
pipeline, y (2) al pasar a Fase 6 (HANDOFF). Las fases intermedias NO actualizan el
espejo — si el proceso se interrumpe, la reanudación se basa en la verificación en
disco de los artefactos requeridos por las fases ya aprobadas (ver Pre-flight punto
2), que es suficiente sin espejos intermedios.
```

Y en la sección "Fases" (línea 83), eliminar la frase "Después de cada resultado
aprobado o salteado, actualizar el único espejo de pipeline..." (reemplazar por
"No se actualiza el espejo entre fases; ver 'Estado del pipeline'.").

#### 2g. Agregar a "Fuentes de verdad" la regla sobre hooks opcionales

En la sección "Fuentes de verdad" (después de la línea 22), agregar como punto 5:

```markdown
5. Los hooks opcionales de `.specify/extensions.yml` (git/agent-context) están
   deshabilitados (`enabled: false`) — ningún subagente Speckit debe mostrarlos ni
   ofrecerlos. Si algún subagente los muestra, ignorarlos.
```

### Edit 3 — `.specify/extensions.yml`

Cambiar `enabled: true` → `enabled: false` en **todos** los hooks que tienen
`optional: true`. Los hooks `optional: false` (before_constitution → git.initialize,
before_specify → git.feature) se mantienen habilitados porque son los que crean la
rama de feature — son necesarios.

Concretamente: todos los `before_clarify`, `before_plan`, `before_tasks`,
`before_implement`, `before_checklist`, `before_analyze`, `before_taskstoissues`,
y todos los `after_*` (constitution, specify, clarify, plan, tasks, implement,
checklist, analyze, taskstoissues) pasan a `enabled: false`.

## Verificación post-ejecución

1. `git status` — debería mostrar: 1 archivo eliminado (`speckit-to-blendverse.md`),
   1 modificado (`blendverse-start-feature.md`), 1 modificado (`.specify/extensions.yml`).
2. `git diff .specify/extensions.yml` — solo cambios `enabled: true → false` en hooks
   `optional: true`.
3. `git diff .opencode/commands/blendverse-start-feature.md` — verificar que la tabla
   de fases sigue teniendo 6 filas, la sección Entrada menciona `complexity`, y la
   sección "Estado del pipeline" menciona los 2 únicos momentos de save.
4. No ejecutar el pipeline completo de prueba (eso lo validará la próxima feature real).

## Rollback

`git checkout -- .opencode/commands/blendverse-start-feature.md .specify/extensions.yml`
y `git checkout -- .opencode/commands/speckit-to-blendverse.md` si surge algún problema.

## Riesgos conocidos y aceptados

- **Riesgo**: una feature que parecía `simple` resulta tener una ambigüedad que clarify
  hubiera detectado. **Mitigación**: la verificación inline de Fase 5 (simple) y el
  Tester/QA/Reviewer de la cadena de implementación siguen siendo redes de seguridad;
  el peor caso es un rebote del Reviewer con feedback, no un bug en producción.
- **Riesgo**: deshabilitar hooks de git impide el auto-commit entre fases.
  **Mitigación**: hoy ya no se auto-commiteaba (los hooks son `optional: true` y
  quedaban como prompts manuales que el usuario ignoraba). No hay pérdida funcional
  real.
- **Riesgo**: menos espejos Engram = menos granularidad al reanudar un pipeline
  interrumpido a mitad de camino. **Mitigación**: la verificación en disco de
  artefactos (Pre-flight punto 2) ya cubre ese caso; el espejo intermedio era
  redundante.
