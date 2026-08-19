---
name: qa-runner
description: Guía al agente @blendverse-qa en la ejecución de validación estática (TypeScript + ESLint + Vitest + estructura de carpetas) y la generación del reporte QA.
---

# Skill: qa-runner

## Propósito

Guía al agente `@blendverse-qa` en la ejecución de validación estática (TypeScript + ESLint + Vitest + estructura de carpetas) y la generación del reporte `memory/{task_id}/03_qa_report.md`.

---

## Secuencia de Validación

Los pasos 1-3 (TypeScript, Linting, Vitest) los ejecuta el script `.opencode/scripts/bash/qa-check.sh <scope>` — corre los 3 realmente en paralelo (background real con control de process groups, no instrucciones en texto) y devuelve un JSON estructurado. `@blendverse-qa` no invoca `tsc`/`eslint`/`vitest` manualmente; invoca el script una sola vez:

```bash
.opencode/scripts/bash/qa-check.sh <scope>
```

`<scope>` es el mismo detectado en `02_dev_log.md → affected_files` (`back-only` | `front-only` | `full-stack`). El script devuelve:

```json
{
  "scope": "...",
  "status": "PASS" | "FAIL" | "TIMEOUT",
  "timeout_secs": 180,
  "steps": {
    "typescript": { "status": "...", "output_tail": "..." },
    "lint": { "status": "...", "output_tail": "..." },
    "vitest": { "status": "...", "output_tail": "..." }
  }
}
```

### 1. Compilación TypeScript

**Criterio:** `status: "PASS"` en `steps.typescript` — el script ya evalúa esto internamente (no hay `error TS` en el output).

### 2. Linting

**Criterio:** `status: "PASS"` en `steps.lint` — el script ya acota el paquete afectado (mismas reglas ESLint, menos archivos) o corre `pnpm lint` si el scope es full-stack.

### 3. Ejecutar Tests con Vitest

**Criterio:** `status: "PASS"` en `steps.vitest` (0 failed). Un status `"TIMEOUT"` significa que el script mató el proceso al cumplirse el límite de tiempo — ver la nota de TIMEOUT en `@blendverse-qa` Paso 2 (hang conocido en specs de Controllers, decisión explícita de no excluirlos). Tratar `TIMEOUT` igual que `FAIL` a efectos del status final de este paso.

### 4. Verificación de Estructura de Carpetas

Ejecuta `.opencode/scripts/bash/audit-arch.sh check <affected_files...>` (ver `@blendverse-qa` Paso 3) — el script ya encapsula los árboles esperados de backend/frontend abajo, con tolerancia consciente a variaciones ya aceptadas en el proyecto (ver comentario en el script sobre `Database`/`Databases`/`Repository`).

**Backend — estructura esperada (referencia, ya validada por el script):**

```
domains/{domain}/
  Domain/
    {Entity}.entity.ts
    {Entity}.repository.ts
    index.ts
  Application/
    {domain}.types.ts
    UseCases/
      GetAll{Entities}.usecase.ts
      Get{Entity}.usecase.ts
      Create{Entity}.usecase.ts
      Update{Entity}.usecase.ts
      Delete{Entity}.usecase.ts
      index.ts
    {Domain}.service.ts
    index.ts
  Infrastructure/
    Controllers/{Domain}.controller.ts
    Database/
      {Entity}.model.ts
      {Entity}Repository.implementation.ts
    Routes/{Domain}.routes.ts
  {domain}.di.ts
  index.ts
```

**Frontend — estructura esperada (referencia, ya validada por el script):**

```
Domains/{Domain}/
  {Entity}.entity.ts
  {Domain}.service.ts
  {Domain}.routes.tsx
  {Domain}.router.tsx
  Hooks/
    useCache{Entities}.ts
    useGet{Entities}.ts
    useGet{Entity}.ts
    useAdd{Entity}.ts
    useUpdate{Entity}.ts
    useDelete{Entity}.ts
    index.ts
  Components/index.ts
  Pages/
    {Entity}List.page.tsx
    {Entity}New.page.tsx
    {Entity}Update.page.tsx
```

**Criterio:** `summary.misplaced == 0` en el JSON del script. Cada archivo `MISPLACED` se marca ❌ en el reporte; `OK` se marca ✅.

### 5. Determinación del Status Final

| Condición                                                             | Status |
| --------------------------------------------------------------------- | ------ |
| tsc sin errores + linter sin errores + tests OK + estructura correcta | `PASS` |
| Cualquier error de tsc                                                | `FAIL` |
| Cualquier error de linter (no warning)                                | `FAIL` |
| Cualquier test fallado                                                | `FAIL` |
| `steps.*.status == "TIMEOUT"` en `qa-check.sh` (hang conocido)        | `FAIL` |
| Archivo en capa incorrecta                                            | `FAIL` |

---

## Template Obligatorio — `03_qa_report.md`

> **Regla de brevedad:** Si el resultado es `PASS`, omitir el output de terminal — solo registrar el estado de cada paso. Si el resultado es `FAIL`, incluir únicamente el error concreto (mensaje + archivo + línea) del paso que falló, no el output completo.

```markdown
---
task_id: 'TASK-{rama}-YYYYMMDD-N'
agent: 'QA_Agent'
status: 'PASS' # PASS | FAIL
attempts: 1
date: 'YYYY-MM-DD'
---

# Reporte de QA — [Título de la Tarea]

## Resultado General: ✅ PASS / ❌ FAIL

| Paso          | Comando                                        | Paquete(s)           | Estado      |
| ------------- | ---------------------------------------------- | -------------------- | ----------- |
| 1. TypeScript | `npx tsc --noEmit`                             | server / app / ambos | ✅ / ❌     |
| 2. Linting    | `eslint` (acotado) / `pnpm lint` si full-stack | server / app / ambos | ✅ / ❌     |
| 3. Tests      | `npx vitest run`                               | server / app / ambos | ✅ X passed |
| 4. Estructura | verificación manual                            | —                    | ✅ / ❌     |

---

## Error (solo si status: FAIL)

**Paso fallido:** [1 / 2 / 3 / 4]

**Error:**
```

[Copiar únicamente el mensaje de error relevante — máximo 20 líneas]

```

**Archivo afectado:** `ruta/al/archivo.ts` — línea X
```

**Acción esperada:** [Descripción concisa de qué debe corregirse]

````

---

## Auto-fixes aplicados (solo si QA corrigió algo en el Paso 2.5 de `@blendverse-qa`)

```markdown
## Auto-fixes aplicados

| Archivo               | Error original (1 línea)      | Categoría                    |
| ---------------------- | ------------------------------ | ----------------------------- |
| `ruta/al/archivo.ts`   | Descripción breve del error    | import / tipo / sintaxis / unused-var |
````

Omitir esta sección por completo si no se aplicó ningún auto-fix.

---

## Reglas de Calidad

1. **Si `status: FAIL`**, incluir el error concreto (mensaje + archivo + línea, máx. 20 líneas) — no el output completo del terminal (ver "Regla de brevedad" arriba).
2. **Sección "Tests (Vitest)"** es obligatoria aunque `status: PASS`.
3. **Si `status: FAIL`**, la sección "Error" es obligatoria.
4. **`attempts`** comienza en `1` y se incrementa en cada re-ejecución.
5. **Si `attempts >= 3`**, no escribir el reporte — ejecutar el Protocolo Break-Loop definido en `@blendverse-qa`.

```

```
