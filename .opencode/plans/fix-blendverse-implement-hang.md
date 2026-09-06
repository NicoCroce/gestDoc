# Plan: Eliminar hang de `@blendverse-implement` en la fase de testing

**Fecha**: 2026-09-05
**Estado**: APROBADO por el usuario, pendiente de ejecución (requiere salir de plan mode)
**Scope**: Cambio A únicamente (B y C documentados como futuro, fuera de este plan)

## Análisis resumido

`@blendverse-implement` se colgaba porque invocaba a `@blendverse-tester`, y el Tester
corría `npx vitest run` (suite completa, sin timeout) siguiendo su protocolo en
`.opencode/agents/blendverse-tester.md` Paso 4. Esa suite completa tiene un hang
pre-existente documentado en `.opencode/scripts/bash/qa-check.sh` (líneas 12-22): los
specs de Controllers usan `vi.mock('@server/Infrastructure')` que arrastra
`TrpcInstance.ts` → modelos Sequelize → conexión a MySQL real esperando
indefinidamente.

El equipo ya mitigó esto para `@blendverse-qa` vía `qa-check.sh` (timeout + kill de
process group), pero nunca propagó la mitigación al Tester ni a los prompts del
orquestador.

## Cambios a aplicar

### 1. `.opencode/agents/blendverse-tester.md` — Paso 4 (líneas 95-104)

**Reemplazar:**

````
### Paso 4 — Ejecutar Tests

```bash
# Backend
cd packages/server && npx vitest run 2>&1

# Frontend (si hay hooks)
cd packages/app && npx vitest run 2>&1
````

Todos los tests generados deben pasar (0 failed). Si alguno falla, corregirlo antes
de devolver el control a `@blendverse-implement`.

```

**Por:**

```

### Paso 4 — Ejecutar Tests (acotado a los archivos afectados)

**No corras la suite completa** (`npx vitest run` sin argumentos). Existe un hang
pre-existente y documentado (ver comentario en `.opencode/scripts/bash/qa-check.sh`)
en los specs de `Controllers` que usan `vi.mock('@server/Infrastructure')`: el
barrel arrastra `TrpcInstance.ts` → modelos Sequelize → intento de conexión a
MySQL real con pool esperando indefinidamente. Correr la suite completa desde el
Tester reproduce ese hang y deja colgada toda la cadena orquestada.

En su lugar, corré vitest **acotado a los archivos de test que vos escribiste o
modificaste en esta tarea** (y los specs ya listados en `affected_files` del
`02_dev_log.md` del Coder, si aplican):

```bash
# Backend — acotado
cd packages/server && npx vitest run <archivo1.spec.ts> <archivo2.spec.ts> ... 2>&1

# Frontend (si hay hooks) — acotado
cd packages/app && npx vitest run <archivo1.spec.ts> ... 2>&1
```

Todos los tests generados deben pasar (0 failed). Si alguno falla, corregirlo antes
de devolver el control a `@blendverse-implement`.

La suite completa la ejecuta `@blendverse-qa` (Paso 2 de su protocolo, vía
`qa-check.sh` que ya maneja el hang con timeout+kill); no es responsabilidad del
Tester.

```

### 2. `.opencode/agents/blendverse-implement.md` — 3 prompts al Tester

Agregar una instrucción explícita al final de cada prompt de invocación al Tester:

**a) Línea 284 (back-only):** cambiar la frase

```

Ejecutar `cd packages/server && npx vitest run 2>&1` y asegurar 0 failed.

```

por

```

Ejecutar los tests con `vitest run` **acotado a los archivos de test afectados por
esta tarea** (no la suite completa, que tiene un hang conocido en specs de
Controllers documentado en `qa-check.sh`) y asegurar 0 failed en esos archivos.

```

**b) Línea 343 (front-only):** misma sustitución para `packages/app`.

**c) Línea 421 (full-stack):** misma sustitución aplicada a ambos `vitest run` (el
de server y el de app).

## Verificación tras aplicar

- `git diff .opencode/agents/blendverse-tester.md .opencode/agents/blendverse-implement.md`
- La próxima invocación a `@blendverse-implement` no debería colgarse en la fase
  tester.

## Fuera de scope (documentado para futuro)

- **Cambio B**: agregar heurística de "asumir hang si el subagente no escribió su
  artefacto" al Paso 2.7 de `blendverse-implement.md`. No necesario una vez que el
  Cambio A elimina la causa raíz.
- **Cambio C**: arreglar la raíz del hang de Controllers (mockear `TrpcInstance` y
  los modelos Sequelize para que `vi.mock('@server/Infrastructure')` no dispare
  conexiones reales). Solución definitiva pero fuera de este pedido.
```
