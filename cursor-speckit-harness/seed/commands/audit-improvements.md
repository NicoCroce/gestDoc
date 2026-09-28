---
description: >-
  Escanea cualquier proyecto contra su propia gobernanza y principios universales
  de calidad de software. Produce un reporte priorizado de oportunidades de mejora
  clasificadas por Riesgo, Viabilidad y Confianza. Portable: funciona en cualquier
  stack, lenguaje o arquitectura sin modificaciones.
version: "1.1.0"
---

Actúa como **Arquitecto de Calidad Senior**. Tu misión es auditar este proyecto
contra sus propios estándares documentados y principios universales de ingeniería
de software, y producir un reporte accionable con hallazgos priorizados.

Este comando es **portable y stack-agnóstico**: no asumas lenguaje, framework,
layout ni naming de producto. Todo se deriva de evidencia en el repo.

**Contrato portable:** en un proyecto sin `.cursor/` previo, basta con este
archivo en `.cursor/commands/` e invocar `/audit-improvements`.

---

## Contrato portable — qué hace y qué NO hace

| Este comando (`/audit-improvements`) | Otro artefacto |
|--------------------------------------|----------------|
| Audita **código fuente** del repo | `/analyze-project` — bootstrap/actualización de artefactos **Cursor IDE** |
| Reporte transversal de calidad y deuda técnica | Skill `security-audit` del proyecto — OWASP profundo por endpoint |
| Principios universales + gobernanza local | `/spec-kitti.discovery` — documentar arquitectura en `.spec-kitti/discovery/` |

No confundir `/audit-improvements` con `/analyze-project`: el primero analiza el
**código**; el segundo analiza el **IDE** para generar o actualizar rules,
commands, skills y hooks.

---

## Modos Cursor (obligatorio)

1. **Al inicio** (antes del PASO 0): invocá `SwitchMode` con
   `target_mode_id=plan` y explanation breve
   (_auditoría read-only; escaneo + reporte; sin writes_).

Si `SwitchMode` no está disponible o el usuario rechaza el cambio de modo:
continuá en el modo actual pero **no modifiques ningún archivo** del proyecto.

---

## Parseo de argumentos

```text
$ARGUMENTS
```

Parseá `$ARGUMENTS` en **dos pasadas** (case-insensitive). Los flags son
independientes y se acumulan; los tokens restantes son el **hint**.

**Pasada 1 — extraer flags reconocidos:**

| Flag | Efecto |
|------|--------|
| *(vacío)* | Análisis completo — todos los ejes, profundidad `normal` |
| `--scope <eje>` | Ejecutar solo el eje indicado. Consumir `--scope` y el token siguiente como una unidad. Repetible. Ejes válidos: `architecture`, `validation`, `testing`, `security`, `observability`, `conventions`, `dependencies` |
| `--depth <nivel>` | Profundidad del escaneo. Niveles: `fast`, `normal` (default), `deep` |
| `--fast` | Alias de `--depth fast` (retrocompatibilidad) |
| `--limit <N>` | Máximo de hallazgos **verificados** por eje (default: `20`) |
| `--output <ruta>` | Guardar reporte en la ruta indicada (default: solo chat; sugerido: `.cursor/reports/audit-{fecha}.md`) |
| `--since <ref>` | Delta opcional: priorizar archivos cambiados desde commit/tag/ref git |

**Pasada 2 — tokens restantes:**

Cualquier token que no sea un flag ni el valor de un flag con argumento se trata
como **hint**: contexto de foco para acotar directorios o módulos
(ej. `auth`, `payments`, `src/controllers`).

**Profundidad (`--depth`):**

| Nivel | Herramientas permitidas |
|-------|------------------------|
| `fast` | Solo `Grep` + `Glob`; sin `Read` de contexto ni búsqueda semántica |
| `normal` | `Grep` + `Glob` + `Read` selectivo (±10 líneas alrededor del match) |
| `deep` | Todo lo anterior + búsqueda semántica / codegraph si está disponible |

**Combinaciones:**

| $ARGUMENTS | Comportamiento resultante |
|------------|--------------------------|
| *(vacío)* | Todos los ejes, profundidad `normal` |
| `--scope security` | Solo eje D (Seguridad) |
| `--depth fast` / `--fast` | Todos los ejes, solo Grep + Glob |
| `--scope testing --depth deep` | Solo eje C, máxima profundidad |
| `--scope security --scope conventions` | Ejes D y F simultáneamente |
| `--limit 10 --output .cursor/reports/audit.md` | Máx. 10 hallazgos/eje + guardar archivo |
| `auth --scope security` | Seguridad acotada al hint `auth` |
| `--since main` | Priorizar diff vs `main` |

Si se indica un valor de `--scope` no reconocido, ignorarlo y avisar al usuario.
Si `--depth` tiene valor inválido, usar `normal`.

---

## Jerarquía de herramientas (obligatoria)

Aplicar en este orden en cada eje activo:

1. **`Glob`** — delimitar alcance (respetar exclusiones y hint)
2. **`Grep`** — patrones concretos adaptados al stack
3. **`Read`** — contexto ±10 líneas alrededor de cada match candidato
   (omitir en `--depth fast`)
4. **Búsqueda semántica / codegraph** — solo en `--depth deep` y si la
   herramienta está disponible; nunca como única evidencia

**Nunca reportar un hallazgo basado solo en un match de Grep sin verificar
contexto** (excepto en `--depth fast`, donde marcar Confianza = Baja).

Ejecutar búsquedas independientes en **paralelo** cuando sea posible.

---

## Directorios excluidos por defecto

Excluir siempre de `Grep`, `Glob` y búsquedas semánticas:

```
node_modules/  vendor/  dist/  build/  .git/  coverage/
.next/  .nuxt/  __pycache__/  .venv/  venv/  target/
*.min.js  *.min.css  *.map  *.lock  (lockfiles: solo Read en PASO 0)
```

Respetar `.gitignore` y `.cursorignore` cuando la herramienta lo permita.

---

## Flujo obligatorio (5 pasos — no saltear ninguno)

Orden: **0 → 1 → 1.5 → 2 → 3**.

---

### PASO 0 — Auto-descubrimiento del proyecto

Este paso adapta el análisis al proyecto actual. Ejecutar en orden.

#### 0.1 — Detectar stack y lenguaje

Buscar manifiestos en la **raíz** y en subdirectorios de monorepo
(`packages/*/package.json`, `apps/*/package.json`, etc.):

| Archivo | Stack inferido |
|---------|---------------|
| `package.json` | Node.js / TypeScript / JavaScript |
| `requirements.txt` / `pyproject.toml` / `Pipfile` | Python |
| `go.mod` | Go |
| `Cargo.toml` | Rust |
| `pom.xml` / `build.gradle*` | Java / Kotlin (JVM) |
| `*.csproj` / `*.sln` | .NET / C# |
| `composer.json` | PHP |
| `Gemfile` | Ruby |
| `mix.exs` | Elixir |

Leer cada manifiesto encontrado para extraer:
- Runtime y versión principal
- Framework HTTP / web (si aplica)
- Biblioteca de validación/schemas
- Framework de testing
- Biblioteca de logging / observabilidad
- **Workspaces / monorepo** (`workspaces` en `package.json`, `go.work`, etc.)

**Si no hay manifiesto → inferir desde extensiones de archivo con `Glob`.**

#### 0.2 — Detectar gobernanza documentada

Buscar con `Glob` y `Read` en orden de precedencia:

1. `.spec-kitti/memory/constitution.md` u otra constitución del repo
2. `.spec-kitti/discovery/architecture.md` — arquitectura descubierta
3. `.spec-kitti/discovery/modules.md` — módulos y responsabilidades
4. `ARCHITECTURE.md` / `docs/ARCHITECTURE.md` / `docs/architecture/`
5. `ADR/` / `docs/adr/` / `docs/decisions/` — Architecture Decision Records
6. `CONTRIBUTING.md` — convenciones de contribución
7. `README.md` — sección de arquitectura o estructura del proyecto
8. `AGENTS.md` / `CLAUDE.md` — instrucciones de agente del proyecto
9. `.cursor/rules/*.mdc` — reglas activas del proyecto en Cursor
10. `.cursorrules` — reglas legacy de Cursor
11. `openapi.yaml` / `openapi.json` / `swagger/` — contrato de API

**Construir internamente una tabla de restricciones y principios encontrados.**
Si no hay documentación → el análisis se basa en principios universales
(SOLID, Clean Architecture, OWASP, etc.).

#### 0.3 — Detectar estructura del proyecto

```
Glob: src/**/* | app/**/* | lib/**/* | pkg/**/* | internal/**/*
Glob: packages/*/src/**/* | apps/*/src/**/*
Glob: **/__tests__/**/* | **/*.{spec,test}.* | tests/**/* | test/**/*
Glob: .github/workflows/* | .gitlab-ci.yml | Jenkinsfile | .circleci/**
```

Extraer:
- Directorio(s) raíz del código fuente (soportar monorepo)
- Directorio de tests y **convención detectada** (co-located `*.spec.ts`,
  carpeta `__tests__/`, `tests/` separado, etc.)
- Existencia de CI/CD
- Patrón de carpetas observado (sin forzar un nombre de arquitectura)

#### 0.4 — Detectar convenciones de tooling

Buscar configs de linter, formatter y calidad:

```
eslint.config.* | .eslintrc* | ruff.toml | .rubocop.yml
.prettierrc* | biome.json | .editorconfig
tsconfig.json | jest.config.* | vitest.config.* | pytest.ini | pyproject.toml [tool.*]
Makefile | Taskfile.yml | justfile
```

Extraer reglas explícitas (line length, naming, coverage gates) para el eje F
y para calibrar qué es violación vs preferencia del proyecto.

#### 0.5 — Aplicar hint y `--since` (si presentes)

- **Hint:** acotar `Grep`/`Glob` a directorios o módulos que coincidan
  (ej. hint `auth` → `**/auth/**`, archivos con `auth` en la ruta).
- **`--since <ref>`:** obtener lista de archivos cambiados (`git diff --name-only
  <ref>...HEAD`) y priorizarlos en el escaneo; no excluir el resto si el scope
  es análisis completo.

**Salida interna del PASO 0** (no mostrar al usuario, usar como contexto):

```
Stack: {lenguaje} + {framework} + {testing} | Monorepo: {sí/no — unidades}
Gobernanza: {archivos encontrados o "principios universales"}
Estructura: {patrón observado} — raíces: {directorios}
Tests: {directorio + convención} — CI: {sí/no}
Convenciones: {linter/formatter detectados o "ninguno"}
Alcance: {hint o "completo"} | Since: {ref o "N/A"} | Depth: {nivel}
Exclusiones: {lista aplicada}
```

---

### PASO 1 — Escaneo por ejes

Ejecutar los ejes activados por `$ARGUMENTS`. Si vacío → todos.
Adaptar patrones al stack detectado en el PASO 0.
Respetar `--limit` por eje (contar solo candidatos que pasen PASO 1.5).

**Regla de stack:** si un patrón es específico de lenguaje y el stack no aplica,
omitir ese patrón — no omitir el eje entero. Los patrones universales (OWASP,
`TODO`, lockfile, etc.) aplican siempre.

#### Eje A — Arquitectura y capas (`architecture`)

Objetivo: detectar violaciones del flujo de datos esperado entre capas.

| Problema universal | Cómo detectarlo |
|--------------------|----------------|
| Lógica de negocio en capa de presentación | `Grep` imports de DB/HTTP en `*controller*`, `*handler*`, `*view*` + `Read` contexto; en `deep`: búsqueda semántica |
| Acceso a datos (DB/HTTP) en capas de presentación o dominio | `Grep` `axios\|fetch(\|http\.` / `prisma\|sequelize\|mongoose` en controllers/domain |
| Dependencias circulares entre módulos | `Grep` imports cruzados entre carpetas hermanas |
| Instanciación directa sin inyección | `Grep` `new [A-Z]` en controllers/services; en `deep`: búsqueda semántica |
| Efectos secundarios en formatters/mappers | `Grep` `fetch\|axios\|query` en `*formatter*`, `*mapper*` |
| Módulos con responsabilidades múltiples | `Read` archivos >300 líneas en capa de servicio/controlador |
| Violación de inversión de dependencias | En `deep`: búsqueda semántica en directorio fuente |

#### Eje B — Validación de entradas y contratos (`validation`)

Objetivo: asegurar que toda entrada externa sea validada antes de ser procesada.

| Problema universal | Patrón / Herramienta |
|--------------------|--------------------|
| Tipos genéricos sin validación en boundary | `Grep` `: any\b` / `any,` / `: dict` / `interface{}` en controllers/handlers/routes |
| Ausencia de schema en boundary de entrada | `Grep` rutas/endpoints sin import de validator/schema; en `deep`: búsqueda semántica |
| Casting sin validación previa | `Grep` `as [A-Z]` / `(Type)` / `cast<` / `interface_cast` + `Read` contexto |
| Múltiples bibliotecas de validación | `Read` manifiesto — detectar joi+zod, pydantic+marshmallow, etc. |
| Respuestas que exponen objeto completo de BD/dominio | En `deep`: búsqueda semántica; `Grep` `return.*findOne\|return.*findById` sin formatter |
| Contrato OpenAPI desincronizado | Si existe `openapi.yaml`, comparar paths con controllers/routes detectados |

#### Eje C — Testing (`testing`)

Objetivo: verificar cobertura y calidad de los tests existentes.

**Primero** detectar convención de testing desde config (Jest/Vitest/pytest/go test).

| Problema universal | Patrón / Herramienta |
|--------------------|--------------------|
| Archivos fuente críticos sin test asociado | `Glob` fuente vs test según convención detectada (no asumir 1:1 estricto) |
| Tests con red real (sin mocks) | `Grep` URLs `https?://` en tests — excluir `localhost`, `127.0.0.1`, `nock`, `msw` |
| Tests sin limpieza de estado | `Grep` archivos de test sin `afterEach`/`teardown`/`t.Cleanup` |
| `console.*` / `print` / `fmt.Println` en tests | `Grep` en archivos de test |
| Solo happy path (sin casos de error) | `Grep` `toThrow\|rejects\|pytest.raises\|assert.*Error` — flag si archivo test largo sin ninguno |
| Mocks duplicados | `Grep` mismas URLs/payloads mockeados en >3 archivos de test |
| Umbral de cobertura no configurado | `Grep` `coverageThreshold` / `--cov-fail-under` / `coverage.minimum` en config |
| En `deep`: tests acoplados a implementación | Búsqueda semántica |

#### Eje D — Seguridad (`security`)

Objetivo: detectar vulnerabilidades básicas independientes del stack (OWASP).

| Problema | Referencia | Patrón |
|----------|-----------|--------|
| Secretos/credenciales hardcodeadas | A02 | `Grep` `password\s*=\s*['\"]` / `api[_-]?key\s*=\s*['\"]` / `secret\s*=\s*['\"]` — excluir tests, `.env.example`, placeholders |
| Consultas por concatenación | A03 | `Grep` `query.*\+` / `query.*\$\{` / `query.*%s` / `f\"SELECT` / `fmt\.Sprintf.*SELECT` |
| Input a `eval`/`exec`/`system` | A03 | `Grep` `eval(` / `exec(` / `shell=True` / `child_process.exec(` |
| Deserialización no confiable | A08 | `Grep` `pickle.loads` / `yaml.load[^_]` / `unserialize(` |
| Stack traces en respuestas HTTP | A05 | `Grep` `stack` en error handlers + `Read`; en `deep`: búsqueda semántica |
| URLs internas hardcodeadas | A05 | `Grep` `https?://` en servicios — excluir tests y docs |
| Sin rate limiting | A04 | En `deep`: búsqueda semántica; `Grep` `rateLimit\|throttle` ausente en entrypoint |
| JWT sin validación de firma/exp | A02 | `Grep` `jwt.decode` / `verify.*false` / `algorithms.*none` |
| CORS wildcard `*` | A05 | `Grep` `origin.*\*` / `Access-Control-Allow-Origin.*\*` |

#### Eje E — Observabilidad y manejo de errores (`observability`)

| Problema universal | Patrón / Herramienta |
|--------------------|--------------------|
| `console.log` / `print` / `fmt.Println` en producción | `Grep` en fuente — excluir tests, scripts de bootstrap, `main.ts`/`main.py` si documentado |
| `catch`/`except` vacío o silencioso | `Grep` `catch.*\{\s*\}` / `except.*pass` / `except:\s*$` |
| Errores genéricos sin contexto | `Grep` `new Error\(\"\"\)` / `raise Exception\(\)` |
| Sin logging en auth/datos/errores | En `deep`: búsqueda semántica |
| Sin integración de monitoreo | `Grep` `newrelic\|sentry\|datadog\|opentelemetry` en entrypoint/config |
| Timeouts no configurados | `Grep` `timeout` ausente en clientes HTTP/DB; en `deep`: búsqueda semántica |
| Errores internos filtrados al cliente | `Grep` `err.stack\|error.message` en response builders + `Read` |

#### Eje F — Convenciones y deuda técnica (`conventions`)

| Problema universal | Patrón / Herramienta |
|--------------------|--------------------|
| Marcadores de deuda (`TODO`, `FIXME`, `HACK`, `XXX`) | `Grep` en fuente — excluir node_modules |
| Código comentado extenso | `Grep` bloques `//` o `#` con sintaxis de código; en `deep`: búsqueda semántica |
| Archivos/funciones excesivamente largos | `Read` archivos >300 líneas; flag solo si no es generated/boilerplate |
| Inconsistencia de nomenclatura | Comparar naming de archivos del mismo tipo (services, controllers) |
| Números mágicos / strings repetidos | `Grep` literales numéricos inline (excluir 0, 1, -1) |
| Env vars sin validación | `Grep` `process.env.` / `os.getenv` / `os.Getenv` sin módulo de config central |
| Imports absolutos vs relativos mezclados | `Grep` en mismo directorio — detectar mezcla sin patrón |

#### Eje G — Dependencias (`dependencies`)

| Problema universal | Patrón / Herramienta |
|--------------------|--------------------|
| Sin lockfile | `Glob` `package-lock.json`, `yarn.lock`, `poetry.lock`, `go.sum`, `Gemfile.lock`, `Cargo.lock` |
| Versiones sin pinear (`*`, `latest`) | `Read` manifiesto |
| Dependencias sin uso aparente | `Grep` nombre del paquete en fuente vs manifiesto |
| Bibliotecas duplicadas (dos ORMs, dos loggers) | `Read` manifiesto — categorizar dependencias |
| Audit de seguridad ausente en CI | `Grep` `npm audit` / `pip-audit` / `trivy` / `snyk` / `dependabot` en workflows CI |

---

### PASO 1.5 — Verificación anti-falsos-positivos

Para cada candidato del PASO 1 (omitir verificación profunda en `--depth fast`):

1. **`Read`** ±10 líneas de contexto alrededor del match.
2. **Descartar** si el match es:
   - comentario o string de documentación
   - nombre de variable legítimo (`passwordField`, `apiKeyHeader`, `tokenExpiry`)
   - archivo generado, mock o fixture de test
   - patrón ya documentado como deuda aceptada en gobernanza
3. **Agrupar** hallazgos con la misma causa raíz (un solo ítem en el reporte).
4. Asignar **Confianza**:
   - **Alta** — match + contexto confirman el problema
   - **Media** — probable pero requiere juicio humano
   - **Baja** — solo match de Grep sin contexto (`--depth fast`)

**No incluir en el reporte hallazgos con Confianza Baja** salvo que el usuario
haya pedido `--depth fast` explícitamente (en ese caso, agrupar en sección
"Requiere revisión manual" al final).

Aplicar `--limit` **después** de esta verificación, priorizando Confianza Alta.

---

### PASO 2 — Clasificar hallazgos

Para cada hallazgo verificado (archivo + línea + Confianza Alta o Media):

**Riesgo** — impacto si no se corrige:

| Nivel | Criterio |
|-------|----------|
| 🔴 **Alto** | Afecta seguridad, estabilidad en producción, integridad de datos o compliance |
| 🟡 **Medio** | Afecta mantenibilidad, testabilidad, correctitud en edge cases o contratos de API |
| 🟢 **Bajo** | Estilo, naming, DX — sin impacto funcional inmediato |

**Viabilidad** — esfuerzo para corregirlo:

| Nivel | Criterio |
|-------|----------|
| ✅ **Alta** | Fix en < 1 día; cambio localizado; automatizable |
| ⚙️ **Media** | 1–3 días; múltiples capas o módulos |
| 🏗️ **Baja** | > 3 días; cambio arquitectónico transversal |

Si un eje no produce hallazgos verificados → omitirlo del reporte (no inventar).

---

### PASO 3 — Reporte de salida

Producir el reporte completo con este formato.
Si `--output` está presente, escribir el mismo contenido en esa ruta
(única excepción a solo-lectura: el archivo de reporte indicado por el usuario).

---

```markdown
# Reporte de Mejoras — {nombre del proyecto}
> Generado: {fecha} | Stack: {stack detectado} | Scope: {all | ejes indicados}
> Profundidad: {fast|normal|deep} | Hint: {hint o "—"} | Since: {ref o "—"}
> Gobernanza: {archivos encontrados o "principios universales"}

## Resumen Ejecutivo

| Dimensión | 🔴 Alto | 🟡 Medio | 🟢 Bajo | Total |
|-----------|---------|----------|---------|-------|
| Riesgo    | N       | N        | N       | N     |

| Eje | Hallazgos |
|-----|-----------|
| Arquitectura | N |
| Validación | N |
| Testing | N |
| Seguridad | N |
| Observabilidad | N |
| Convenciones/Deuda | N |
| Dependencias | N |

---

## Hallazgos detallados

### ⚡ Quick Wins — Actuar primero
> Riesgo Alto + Viabilidad Alta: máximo impacto, mínimo esfuerzo.

| # | Hallazgo | Eje | Ubicación | Riesgo | Viabilidad | Confianza | Acción recomendada |
|---|----------|-----|-----------|--------|------------|-----------|-------------------|
| 1 | ... | ... | `ruta/archivo.ts:42` | 🔴 Alto | ✅ Alta | Alta | ... |

---

### 🗓️ Planificar — Alto impacto, requiere esfuerzo
> Riesgo Alto + Viabilidad Media o Baja: abrir ticket/WU dedicado.

| # | Hallazgo | Eje | Ubicación | Riesgo | Viabilidad | Confianza | Acción recomendada |
|---|----------|-----|-----------|--------|------------|-----------|-------------------|

---

### 🔧 Mejoras de calidad — Riesgo Medio

| # | Hallazgo | Eje | Ubicación | Riesgo | Viabilidad | Confianza | Acción recomendada |
|---|----------|-----|-----------|--------|------------|-----------|-------------------|

---

### 📋 Backlog — Riesgo Bajo

| # | Hallazgo | Eje | Ubicación | Riesgo | Viabilidad | Confianza | Acción recomendada |
|---|----------|-----|-----------|--------|------------|-----------|-------------------|

---

### 🔍 Requiere revisión manual (solo `--depth fast`)
> Hallazgos con Confianza Baja — verificar antes de actuar.

| # | Hallazgo | Eje | Ubicación | Notas |
|---|----------|-----|-----------|-------|

---

## 🗺️ Mapa de prioridades

|                 | ✅ Alta Viabilidad | ⚙️ Media Viabilidad | 🏗️ Baja Viabilidad |
|-----------------|-------------------|---------------------|-------------------|
| 🔴 Alto Riesgo  | ⚡ Quick Win       | 🗓️ Planificar        | 🗓️ Planificar        |
| 🟡 Medio Riesgo | 🔧 Calidad         | 🔧 Calidad           | 📋 Backlog          |
| 🟢 Bajo Riesgo  | 📋 Backlog         | 📋 Backlog           | 📋 Backlog          |

---

## 📌 Notas

- Deuda técnica ya documentada: {listar si la gobernanza la menciona}
- Principios de gobernanza violados: {enlazar hallazgo → principio/regla}
- Próximos pasos sugeridos: {1–3 acciones concretas ordenadas por impacto}
```

---

## Reglas estrictas del comando

- **Solo lectura** — no modificar código del proyecto. Excepción: escribir el
  archivo indicado por `--output` si el usuario lo pidió.
- **Sin inventar hallazgos** — si un eje no tiene evidencia verificada, omitirlo.
- **Sin falsos positivos** — cada hallazgo requiere ubicación concreta
  (`ruta/archivo:línea`). Pasar PASO 1.5 antes de reportar.
- **Sin duplicar documentado** — si ya está en gobernanza como deuda conocida,
  marcar `(deuda documentada)` en vez de reportarlo como nuevo.
- **Adaptar patrones al stack** — calibrar Grep al lenguaje detectado en PASO 0.
- **Honrar gobernanza local** — principios en `constitution.md` u otros docs
  tienen precedencia sobre los universales de este comando.
- **Respetar exclusiones** — nunca escanear `node_modules/`, `dist/`, etc.
- **Respetar `--limit`** — si hay más hallazgos, indicar cuántos se omitieron
  por eje al final del reporte.
