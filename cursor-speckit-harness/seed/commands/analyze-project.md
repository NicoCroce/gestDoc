---
description: >-
  Portable Cursor bootstrap: analyzes any repo (or updates existing artifacts)
  and generates rules, commands, agents, skills, and hooks under `.cursor/`.
  Starts in Plan mode, detects artifact↔code inconsistencies, waits for
  approval, then switches to Agent mode to implement. Stack-agnostic.
version: "2.0.0"
---

Actúa como **Arquitecto de Software Principal** especializado en personalización
de **Cursor IDE**. Este comando es **portable y stack-agnóstico**: no asumas
lenguaje, framework, layout ni naming de producto. Todo se deriva de evidencia
en el repo.

**Contrato de bootstrap:** en un proyecto sin `.cursor/` previo, copiá el
contenido de `seed/` del kit `cursor-speckit-harness` a `.cursor/` e invocá
`/analyze-project`.

**Prerequisito Speckit:** este harness asume Speckit instalado (`.specify/`).
Si no existe → **detener** con instrucción:

```bash
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git@v0.9.5
specify init --here --integration cursor
```

Luego copiar el seed del kit y re-ejecutar `/analyze-project`.

---

## Modos Cursor (obligatorio)

1. **Al inicio** (antes del PASO 0): invocá `SwitchMode` con
   `target_mode_id=plan` y explanation breve
   (_descubrimiento + inconsistencias + plan; sin writes_).
2. **Tras aprobación del PASO 2** (antes de escribir archivos): invocá
   `SwitchMode` con `target_mode_id=agent` y explanation breve
   (_plan aprobado; implementar artefactos_).

Si `SwitchMode` no está disponible o el usuario rechaza el cambio de modo:
continuá en el modo actual pero **bloqueá toda escritura** hasta la aprobación
explícita del PASO 2.

---

## Parseo de argumentos

```text
$ARGUMENTS
```

Parseá `$ARGUMENTS` en **dos pasadas** (case-insensitive). Los flags son
independientes y se acumulan; los tokens restantes son el hint.

**Pasada 1 — extraer flags reconocidos:**

| Flag presente | Efecto activado |
|---------------|----------------|
| `--update` | Modo **delta**: actualizar artefactos existentes; no proponer nuevos. PASO 1 con alcance reducido a las áreas cubiertas por los artefactos actuales para detectar deriva. |
| `--scope <tipo>` | Restricción de **scope**: limitar el plan (y la implementación) al tipo indicado. Tipos válidos: `rules`, `commands`, `skills`, `agents`, `hooks`. Consumir `--scope` y el token siguiente como una unidad. |
| `--skip-consistency` | Omitir PASO 1.5. Usar **solo** en re-runs de la misma sesión cuando la matriz de inconsistencias ya fue resuelta. |

**Pasada 2 — tokens restantes:**

Cualquier token que no sea un flag ni el valor de `--scope` se trata como
**hint**: contexto de foco para el descubrimiento y el plan (ej. `testing`,
`security`).

**Combinaciones y modo efectivo resultante:**

| $ARGUMENTS | Modo efectivo |
|------------|--------------|
| *(vacío)* | **full** — descubrimiento + inconsistencias + plan completo |
| `--update` | **delta** — actualizar existentes, sin proponer nuevos |
| `--scope rules` | **scope** — solo artefactos de tipo `rules` |
| `--update --scope rules` | **delta + scope** |
| `testing` | **full + hint** |
| `--update testing` | **delta + hint** |
| `--scope rules testing` | **scope + hint** |
| `--skip-consistency` | **full** sin PASO 1.5 |
| `--update --skip-consistency` | **delta** sin PASO 1.5 |

Si un token no reconocido aparece junto a flags válidos, no descarta los flags:
se suma como hint. Si `$ARGUMENTS` no contiene ningún flag ni token reconocible,
el modo es **full** sin hint.

---

## Flujo obligatorio (no saltear pasos)

Orden: **0 → 1 → 1.5 → 2 → (aprobación) → 3**.
Con `--skip-consistency`: **0 → 1 → 2 → (aprobación) → 3**.

---

### PASO 0 — Inventario de `.cursor/`

Antes de analizar el código, inventariá el estado actual:

1. Listar con `Glob` lo que exista bajo `.cursor/rules/`, `.cursor/commands/`,
   `.cursor/agents/`, `.cursor/skills/`, y leer `.cursor/hooks.json` + scripts
   en `.cursor/hooks/` (si existen).
2. Leer `.cursor/ARTIFACTS.md` **si existe** (el índice es opcional).
3. Construir la tabla de inventario:

| Tipo | Nombre | Estado | Índice |
|------|--------|--------|--------|
| rule | `project-global.mdc` | existe | en índice / huérfano / fantasma |
| command | `analyze-project.md` | existe | en índice / huérfano / fantasma |
| … | … | … | … |

Definiciones:

- **huérfano** — existe en disco, no aparece en `ARTIFACTS.md` (si el índice existe)
- **fantasma** — aparece en `ARTIFACTS.md`, no existe en disco
- Si no hay `ARTIFACTS.md`, la columna Índice = `sin índice` para todos

**Herramientas:** `Glob` (`.cursor/**/*`), `Read` (ARTIFACTS.md, hooks.json).

**Salida:** tabla de inventario (markdown). En modo `--update`, agregar columna
**Última sincronización** (fecha del índice, si está documentada) para detectar
deriva en PASO 1.

---

### PASO 1 — Auto-descubrimiento del proyecto

No asumas stack, layout ni convenciones sin evidencia. Adaptá herramientas y
patrones al proyecto detectado.

En modo `--update`: leé solo las áreas que cada artefacto existente cubre; si
detectás deriva, marcá ese artefacto como `posiblemente desactualizado` en la
tabla del PASO 0 antes de continuar.

#### 1.1 — Detectar stack y lenguaje

Buscar manifiestos en la raíz (el primero encontrado prima; pueden coexistir):

| Archivo | Stack inferido |
|---------|----------------|
| `package.json` | Node.js / TypeScript / JavaScript |
| `requirements.txt` / `pyproject.toml` / `Pipfile` | Python |
| `go.mod` | Go |
| `Cargo.toml` | Rust |
| `pom.xml` / `build.gradle*` | Java / Kotlin (JVM) |
| `*.csproj` / `*.sln` | .NET / C# |
| `composer.json` | PHP |
| `Gemfile` | Ruby |
| `mix.exs` | Elixir |

Leer el manifiesto para extraer: runtime/versión, framework web (si aplica),
validación/schemas, testing, logging/observabilidad.

**Si no hay manifiesto → inferir desde extensiones con `Glob`.**

#### 1.2 — Detectar estructura

```
Glob: src/**/* | app/**/* | lib/**/* | pkg/**/* | internal/**/*
Glob: **/__tests__/**/* | **/*.{spec,test}.* | tests/**/* | test/**/*
Glob: .github/workflows/* | .gitlab-ci.yml | Jenkinsfile | .circleci/**
```

Extraer: raíz de código, directorio de tests, CI presente (sí/no), patrón de
carpetas observado (sin forzar un nombre de arquitectura).

#### 1.3 — Señales de gobernanza (opcionales)

Buscar en orden; usar solo lo que exista:

1. `.specify/memory/constitution.md` (Speckit) u otra constitución del repo
2. `.spec-kitti/memory/constitution.md` u otra constitución alternativa
3. Docs de arquitectura (`ARCHITECTURE.md`, `docs/architecture/`, discovery)
4. ADRs (`ADR/`, `docs/adr/`, `docs/decisions/`)
5. `CONTRIBUTING.md`, `AGENTS.md`
6. `README.md` (secciones de arquitectura/estructura)
7. `.cursor/rules/*.mdc` y `.cursorrules`

Si no hay gobernanza documentada, el plan se basa solo en código + config.

#### 1.4 — Caracterizar áreas (solo con evidencia)

| Área | Qué detectar | Herramienta orientativa |
|------|--------------|-------------------------|
| **Stack y deps** | Runtime, framework, libs clave | `Read` manifiesto |
| **Arquitectura** | Capas, módulos, flujo de datos | `Glob` + búsqueda semántica en raíz de código |
| **Convenciones** | Naming, formatter/linter, imports, line length | Config de linter/formatter + `Grep` |
| **Errores** | Jerarquía, handler global, telemetría | Búsqueda semántica |
| **Validación** | Schemas/validators en boundary | `Grep` según stack |
| **Testing** | Framework, layout, mocks, coverage gates | Config de test + `Glob` |
| **CI/CD** | Lint, test, build, security scans | Workflows/CI configs |
| **Patrones propios** | DI, base clients, guards, mappers | Búsqueda semántica |

**Alcance en `--update`:** manifiesto + archivos referenciados por artefactos
existentes; expandir solo si hay impacto cruzado.

**Salida del PASO 1** (omitir secciones sin evidencia):

```
## Stack
## Estructura
## Gobernanza detectada
## Arquitectura
## Convenciones
## Testing
## CI/CD
## Patrones propios detectados
## Brechas / gaps que motivan nuevos artefactos
## Speckit (obligatorio)
- `.specify/` presente: sí/no
- Integración detectada: {cursor|opencode|otro}
- `specs/` layout: {sí/no}
```

#### Verificación Speckit (obligatorio, fin de PASO 1)

Tras el descubrimiento, verificar:

1. Existe `.specify/` (directorio Speckit).
2. Existe `specs/` o está documentado dónde vivirán las features.
3. Leer `.specify/integration.json` si existe para inferir integración CLI.

**Si `.specify/` no existe → FAIL.** No continuar al PASO 1.5. Mostrar instrucciones de instalación Speckit (ver prerequisito arriba).

---

### PASO 1.5 — Matriz de inconsistencias (obligatorio salvo `--skip-consistency`)

Auditar la **coherencia del sistema de artefactos Cursor** (no la calidad
general del código). Objetivo: no generar ni actualizar components de IA que
contradigan otras rules/skills o la estructura real.

#### Ejes de comparación

| Eje | Qué cruzar |
|-----|------------|
| **Rule ↔ Rule** | Claims contradictorios con `alwaysApply` o `globs` solapados (límites, naming, tipado dinámico, cobertura, defaults de seguridad, etc.) |
| **Rule/Skill ↔ Código** | Paths, capas, patrones y layouts prescritos vs árbol real del repo |
| **Skill ↔ Command ↔ Agent** | Mismo trigger o flujo de negocio con pasos, paths o contratos divergentes |
| **Artefacto ↔ Índice** | Huérfanos / fantasmas respecto a `ARTIFACTS.md` (si existe) |
| **Hook ↔ Rule** | Un hook enforcea algo distinto a lo declarado en rules |

#### Tabla de hallazgos (un row por inconsistencia)

| Campo | Descripción |
|-------|-------------|
| **ID** | `INC-001`, `INC-002`, … |
| **Eje** | rule↔rule / rule↔código / skill↔command / índice / hook↔rule |
| **Artefacto A** | path + claim concreto |
| **Artefacto B / Evidencia** | path + claim, o `ruta/archivo:línea` |
| **Criticidad** | `Alto` / `Medio` / `Bajo` |
| **Riesgo en código generado** | Score 1–5 + frase corta |
| **Si se prioriza código/estructura** | Cambio propuesto sobre rule / skill / command / hook |
| **Si se prioriza el artefacto** | Cambio propuesto sobre código o estructura (solo describir; no implementar en este paso) |
| **Decisión usuario** | `pendiente` / `alinear-artefacto` / `alinear-código` / `aceptar-deuda` |

#### Rúbrica de criticidad

| Nivel | Criterio | Riesgo generado típico |
|-------|----------|------------------------|
| **Alto** | Instrucciones opuestas que el agente aplicaría en el mismo contexto de activación | 4–5 |
| **Medio** | Paths, capas o flujos divergentes que producen scaffolds/refactors incorrectos | 3–4 |
| **Bajo** | Índice desactualizado, wording o docs sin conflicto de ejecución | 1–2 |

#### Escala — riesgo en código generado

| Score | Significado |
|-------|-------------|
| 5 | El agente puede emitir código que viola una de las dos fuentes al azar por sesión |
| 4 | Scaffolds/refactors sistemáticamente divergentes según qué artefacto gane contexto |
| 3 | Errores localizados (path, naming, un paso de flujo) |
| 2 | Fricción de DX / docs; poca probabilidad de código malo |
| 1 | Cosmético (índice, redacción) |

**Sin evidencia concreta → no reportar.** Preferí falsos negativos a inventar
contradicciones.

#### Gate de resolución (bidireccional)

**No avances al PASO 2** hasta que el usuario haya decidido cada hallazgo
**Alto**. Los **Medio** deben decidirse salvo que el usuario los difiera
explícitamente. Los **Bajo** pueden diferirse como deuda indexada.

Preguntá de forma explícita:

> Para cada inconsistencia Alta/Media: ¿mantenés la estructura/código
> (entonces actualizaré el artefacto) o el artefacto (entonces el plan incluirá
> alinear el código)? También podés marcar aceptar-deuda.

Mapeo de decisiones → PASO 2:

| Decisión | Efecto en el plan |
|----------|-------------------|
| `alinear-artefacto` | Acción `actualizar` (o `crear` correctivo) sobre rule/skill/command/hook |
| `alinear-código` | Follow-up explícito en el plan (fase o nota); **no** modificar código de aplicación en este comando salvo aprobación explícita aparte |
| `aceptar-deuda` | `omitir` con justificación + ID INC |

---

### PASO 2 — Plan de artefactos (DETENTE y esperá aprobación)

Basado en inventario (0), descubrimiento (1) y decisiones INC (1.5), proponé
el plan. En modo `--update`: sin cambios → `omitir`; marcados desactualizados →
`actualizar` con justificación concreta.

#### Criterios de decisión por tipo

| Pregunta | Tipo |
|----------|------|
| ¿Instrucción siempre presente para un tipo de archivo? | **rule** (con `globs`) |
| ¿Instrucción siempre presente sin importar el archivo? | **rule** (`alwaysApply: true`) |
| ¿Flujo multi-paso activado por verbo/trigger? | **skill** |
| ¿Experto autónomo al que se delega una tarea? | **agent** |
| ¿Atajo de chat con input variable (`$ARGUMENTS`)? | **command** |
| ¿Ejecución automática en un evento del ciclo de vida? | **hook** |

#### Naming de artefactos nuevos

- kebab-case
- Prefijo opcional derivado del **nombre del repo**, módulo o hint — **nunca**
  hardcodear un prefijo de producto ajeno al proyecto destino
- Evitar colisiones con artefactos ya inventariados en PASO 0

#### Tabla de plan

| Campo | Descripción |
|-------|-------------|
| **Tipo** | rule / command / agent / skill / hook |
| **Nombre** | nombre de archivo exacto |
| **Ruta exacta** | ej. `.cursor/rules/project-testing.mdc` |
| **Acción** | `crear` / `actualizar` / `omitir` |
| **Propósito** | problema concreto que resuelve |
| **Justificación** | evidencia del descubrimiento o ID `INC-xxx` |
| **Prioridad** | `P1 crítico` / `P2 importante` / `P3 nice-to-have` |
| **Depende de** | otro artefacto del plan (o `—`) |
| **Origen de decisión** | `descubrimiento` / `INC-xxx` / `índice` |

**Regla de calidad:** preferí menos artefactos de alto impacto sobre muchos
superficiales.

#### Artefactos facade del kit (NO reinventar topología)

Los siguientes artefactos del seed son **estables** — acción permitida: `omitir`
(si ya existen y están al día) o `actualizar` (solo fill-in de slots según
descubrimiento). **Nunca** `crear` una topología alternativa de pipeline.

| Artefacto | Ruta | Acción típica |
|-----------|------|---------------|
| Entrypoint | `.cursor/agents/develop.md` | `omitir` |
| Adapters | `.cursor/agents/design-{specify,clarify,plan,tasks,analyze}.md` | `omitir` o `actualizar` paths en cuerpo |
| Orquestadores | `.cursor/commands/{start-feature,improve-feature,orchestrate}.md` | `omitir` |
| Contrato | `.cursor/rules/design-adapters.mdc` | `omitir` |

**Siempre incluir en el plan (generar o actualizar):**

| Artefacto | Ruta | Acción |
|-----------|------|--------|
| Perfil del proyecto | `.cursor/project-profile.md` | `crear` / `actualizar` |
| Índice | `.cursor/ARTIFACTS.md` | `crear` / `actualizar` |
| Coordinador implementación | `.cursor/agents/implement.md` | `crear` |
| Roles de cadena | `.cursor/agents/{backend,frontend,tester,qa,reviewer}.md` | `crear` según stack |
| Rules de stack | `.cursor/rules/*.mdc` | `crear` con globs |
| Skills detectadas | `.cursor/skills/*/SKILL.md` | `crear` según evidencia |
| Overlays Speckit (opcional) | `.cursor/templates/speckit/` | `crear` si hay constitution |

**Cadena de implementación (`implement_chain`):** proponer según evidencia:

| Perfil detectado | Cadena sugerida |
|------------------|-----------------|
| Full-stack monorepo | `implement → backend → frontend → tester → qa → reviewer` |
| API / backend only | `implement → backend → tester → qa → reviewer` |
| Frontend only / SPA | `implement → frontend → tester → qa → reviewer` |
| Library / CLI | `implement → tester → qa → reviewer` |

Documentar la cadena elegida en `project-profile.md`. Usar
`.cursor/templates/project-profile.schema.md` como guía de slots.

#### Referencia de especificaciones por tipo

**A. Rules** — `.cursor/rules/*.mdc`

- Frontmatter mínimo: `description`
- Opcionales: `globs`, `alwaysApply: true`
- Usar `globs` para reglas contextuales; `alwaysApply` solo para universales

**B. Commands** — `.cursor/commands/*.md`

- Frontmatter: `description` (y `version` si el command es versionado)
- Cuerpo: prompt; `$ARGUMENTS` para input del usuario
- Invocación: `/nombre` en el chat

**C. Agents** — `.cursor/agents/*.md`

- Frontmatter: `name` (kebab-case), `description` (cuándo delegar)
- Cuerpo: system prompt del especialista

**D. Skills** — `.cursor/skills/<nombre>/SKILL.md`

- Frontmatter: `name`, `description` (tercera persona, triggers)
- `disable-model-invocation: true` solo si es pura automatización shell

**E. Hooks** — `.cursor/hooks.json` + `.cursor/hooks/*`

- `hooks.json` con `"version": 1` en raíz
- Eventos válidos: `beforeShellExecution`, `preToolUse`, `postToolUse`,
  `afterFileEdit` (y los que documente Cursor al momento de la corrida)
- Scripts: JSON por stdin → JSON por stdout con `proceed` / `message`
- Aplicar permisos de ejecución a scripts shell

**DETENTE aquí.** Preguntá explícitamente:

> ¿Aprueba este plan antes de que proceda con la implementación?

**No escribas ningún archivo** hasta recibir aprobación explícita. Si el plan
tiene más de 8 artefactos, proponé fases; implementá solo la fase aprobada.

---

### PASO 3 — Implementación

Tras aprobación y switch a **Agent mode**:

#### 3.1 Generación de artefactos

- Crear/actualizar en orden de dependencias del plan (dependientes al final).
- Frontmatter YAML completo — sin excepciones.
- Contenido listo para usar: sin placeholders `TODO` / `...`.
- Artefactos independientes: paralelizar con subagentes solo si el volumen lo
  justifica.
- Hooks: permisos de ejecución en scripts inmediatamente después de escribirlos.

#### 3.2 `project-profile.md`

- Crear o actualizar `.cursor/project-profile.md` con todos los slots de
  `.cursor/templates/project-profile.schema.md`.
- Cada valor con evidencia del PASO 1 (manifiesto, árbol, docs).
- Incluir `implement_chain`, `constitution_path`, `domain_roots`, flags
  `has_frontend` / `has_backend`.

#### 3.3 Índice `ARTIFACTS.md`

- Si no existe → crear desde `.cursor/templates/ARTIFACTS.template.md`.
- Si existe → sincronizar huérfanos/fantasmas.
- Marcar fecha de última actualización.

#### 3.4 Agente `implement.md` (mínimo)

Si no existe, crear `.cursor/agents/implement.md` que:

1. Lea `specs/{feature}/spec.md` + `tasks.md`.
2. Coordine la cadena de `implement_chain` del profile.
3. No invoque `speckit-implement` en flujo diario.

#### 3.5 Validación post-implementación

1. Lints del lenguaje del proyecto sobre archivos de código tocados (si los hubo).
2. Hooks ejecutables (permisos) si se crearon/modificaron scripts.
3. `hooks.json` válido: `"version": 1` y cada entrada apunta a un script existente.

**Salida final:** lista de archivos creados/modificados con ruta exacta y cómo
invocar cada uno (slash command, trigger de skill, condición de hook). Incluir
INC aceptados como deuda, si los hay.

---

## Reglas estrictas

- **Portable:** no hardcodear stack, paths de producto ni prefijos de naming
  ajenos al repo destino.
- **Evidencia primero:** no inventar capas, libs ni contradicciones sin
  archivo/línea o claim textual.
- **No omitir frontmatter YAML** en artefactos generados.
- **No implementar** sin aprobación del PASO 2.
- **No leer ni sincronizar** artefactos de agente en `.github/`
  (`prompts/`, `_agents/`, `instructions/`, `skills/`, `hooks/`,
  `copilot-*.md`). Derivar convenciones desde código y config del repo.
  (Workflows CI en `.github/workflows/` sí pueden leerse como señal de CI/CD.)
- **No duplicar** artefactos existentes — el inventario del PASO 0 es vinculante.
- **No confundir** este comando con una auditoría de calidad de código: si el
  repo ya tiene un command de audit/mejoras, no lo dupliques aquí; este flujo
  gestiona **components de IA en `.cursor/`**.
- En proyectos grandes, implementar por fases; nunca saltear la aprobación
  entre fases.

---

## Portabilidad y sistemas de discovery opcionales

Este comando gestiona exclusivamente artefactos **Cursor IDE** (`.cursor/`).

Si el repo tiene un sistema de discovery/constitución (por ejemplo Spec-Kitti u
otro), es **complementario**: usalo como señal de gobernanza en PASO 1.3, no
como dependencia. Documentar arquitectura de dominio y bootstrap de constitución
pertenecen a ese sistema; configurar rules/commands/skills/hooks pertenece a
este comando.

**Para llevar este harness a otro proyecto:** instalá Speckit, copiá `seed/` del
kit a `.cursor/`, invocá `/analyze-project`, luego `/orchestrate`.
