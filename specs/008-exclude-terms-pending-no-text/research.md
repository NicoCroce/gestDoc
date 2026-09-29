# Research: Sin texto de términos no existe pendiente de aceptación

**Feature**: `008-exclude-terms-pending-no-text` | **Fecha**: 2026-09-28

## Método

Auditoría de código sobre los cuatro canales/superficies que hoy señalizan el pendiente de
aceptación de términos, siguiendo el flujo desde el scheduler/procedure hasta la query Sequelize
y la plantilla de email. Se usó lectura directa de archivos y el grafo de conocimiento del
proyecto. No quedan `NEEDS CLARIFICATION`: el spec y sus _Clarifications_ (2026-09-28) resuelven
el alcance, la definición de "sin texto" y la decisión de "omitir todo" en el reporte.

## Hallazgo raíz: la regla canónica ya existe, pero está duplicada de forma inconsistente

`Auth/Application/UseCases/Login.usecase.ts` (líneas 70-72) define la regla correcta:

```ts
const requiresDisclaimer = Boolean(ownersys?.values.texto_disclaimer?.trim());
```

Es decir, "sin texto" = `texto_disclaimer` nulo, vacío **o solo espacios/tabs/saltos**. Esa
definición ya es la que evita que el modal de aceptación aparezca en el login para empresas sin
texto. Sin embargo:

- `Disclaimer/Application/UseCases/SendReminders.usecase.ts` (línea 35) usa el guard **débil**
  `if (!disclaimerText) return`, que **no** cubre cadenas solo con espacios en blanco.
- `EmployeeReminders` y `DailyReport` **no consultan el texto en absoluto**: cuentan/lista el
  pendiente por `estado_firma !== 'Firmado'` y por la ausencia de aceptación, sin importar si la
  empresa tiene texto.
- La UI de `Admin` deriva "Pendiente" de `estado_firma` (backend) sin saber si la empresa tiene texto.

### Decisiones

**D1 — Helper compartido como definición única de "sin texto".**

- **Decision**: crear `hasDisclaimerText(text?: string | null): boolean` en
  `packages/server/src/Infrastructure/utils/disclaimerUtils.ts`, exportado desde el barrel
  `@server/Infrastructure`. Implementación: `Boolean(text?.trim())`.
- **Rationale**: la regla ya existe en `Login`; extraerla evita que cada dominio la reimplemente y
  se desincronice (el caso real ya ocurrió: `SendReminders` quedó sin `.trim()`). Es una función pura
  sin Sequelize → corresponde a `Infrastructure/utils/` según `server.instructions.md`.
- **Alternativas consideradas**:
  - Duplicar `Boolean(text?.trim())` en cada dominio. Rechazada: reintroduce divergencia futura.
  - Helper dentro del `Domain` de Disclaimer e importarlo cross-domain. Rechazada: obliga a los
    otros dominios a importar de `Domain` ajeno; el proyecto ya centraliza utilidades puras en
    `Infrastructure/utils/`.

**D2 — Disclaimer es el dueño de la bandera a nivel empresa.**

- **Decision**: nuevo use case `HasDisclaimerText implements IUseCase<boolean>` en
  `Disclaimer/Application/UseCases/`, owner-scoped desde `RequestContext.values.ownerId`. Reutiliza
  el use case existente `GetDisclaimerText` (mismo dominio) y aplica `hasDisclaimerText(...)` al
  texto devuelto. Se registra como `_hasDisclaimerText` en `disclaimer.di.ts`.
- **Rationale**: el concepto "términos de la empresa" pertenece al dominio Disclaimer; `GetDisclaimerText`
  ya resuelve la fuente (`OwnersysRepository.getOwnersys` → `Sis_propietarios.texto_disclaimer`).
  Al componer sobre `GetDisclaimerText`, el nuevo use case **no agrega imports de repositorios
  cross-domain** (Principio VII) y concentra la fuente de verdad en un único punto.
- **Alternativas consideradas**:
  - Inyectar `OwnersysRepository` directo en cada dominio. Rechazada: viola VII y duplica la lectura.
  - Reutilizar `getText` y derivar `!!text.trim()` en el frontend. Rechazada por `frontend-design.md`
    (bandera desde el backend, sin chequeos repetidos) y por FR-001 (backend dueño de la regla).
  - Agregar `texto_disclaimer` a `ICompanyOwner` (`GetAllActiveOwners`) para leerlo gratis en las
    corridas diarias. Rechazada: `GetAllActiveOwners` lee de `CompaniesModel` (`Sis_propietarios`),
    que **no** declara `texto_disclaimer`; agregarlo obliga a tocar el dominio Users y su query, y
    no resuelve la bandera del frontend.

**D3 — Bandera al frontend por procedure dedicada (una sola fuente).**

- **Decision**: nueva query tRPC `disclaimer.hasText` → `boolean`, sin input (owner desde
  `RequestContext`). El hook `useHasDisclaimerText` la consulta una vez en la página de empleados y
  **propaga por props** a columnas, tarjetas y estadísticas.
- **Rationale**: `frontend-design.md` regla 2 exige "un único interruptor... una bandera a nivel
  empresa desde el backend". Una procedure dedicada es explícita, no contamina el contrato genérico
  `IPaginationResponse` de `getEmployees`, y el dominio `Admin` ya consume el router `disclaimer`.
- **Alternativas consideradas**:
  - Agregar `hasDisclaimerText` al response de `getEmployees`. Rechazada: `IPaginationResponse<T>` es
    una interfaz global compartida por todos los dominios; meterle un campo de Disclaimer acopla
    transversalmente y rompe el contrato.
  - Agregar la bandera al payload de `auth.login` (`dataUser`). Rechazada: quedaría _stale_ hasta el
    próximo login si la empresa configura/borra el texto; el spec pide reflejar el estado al momento
    de renderizar (Assumptions).

**D4 — Gate por dominio en el backend.**

- **Decision**:
  - `EmployeeReminders.GenerateDailyReminder`: inyecta `HasDisclaimerText`, lo computa **una vez por
    empresa** y calcula `pendingDisclaimerAcceptance: hasText && employee.estado_firma !== 'Firmado'`.
  - `Disclaimer.GetPendingDisclaimerAcceptances` y `Disclaimer.CountPendingDisclaimers`: se auto-gatean
    (devuelven `[]` / `0` cuando la empresa no tiene texto), porque son queries de negocio del dominio
    dueño de la regla. Esto cubre automáticamente a `GetStatisticalSummary` sin modificarlo.
  - `DailyReport.GenerateDailyReport`: inyecta `HasDisclaimerText` solo para poblar el flag
    `hasDisclaimerText` del DTO (que usa el template de email para omitir).
- **Rationale**: cada dominio enforza la regla en su frontera; cualquier consumidor futuro (presente
  o no) obtiene datos coherentes. El flag del reporte permite la omisión **estructural** que el
  template necesita.
- **Alternativas consideradas**:
  - Gatear solo en `GenerateDailyReport` (orquestador) y dejar los use cases de sección intactos.
    Rechazada como diseño único: un consumidor directo de `CountPendingDisclaimers` seguiría contando.
    (Se acepta el costo de hasta 3 lecturas de la misma fila por reporte; son triviales y no hay N+1
    por empleado.)
  - `null`/sección opcional en el DTO en lugar de un flag. Se prefiere el flag explícito: mantiene el
    shape de `sections` estable y localiza la decisión de omisión en el template.

**D5 — Omisión total en el email del reporte.**

- **Decision**: `IDailyReport` (Domain y `Templates/types.ts`) gana `hasDisclaimerText: boolean`.
  `dailyReport.template.ts` renderiza la fila "Términos sin aceptar" del resumen y la sección
  "Términos y condiciones sin aceptar" **solo si** `hasDisclaimerText` es `true`.
- **Rationale**: FR-005 / SC-002 exigen ausencia total, no ceros ni "No existen coincidencias".
  `renderSection` con items vacíos hoy imprime el mensaje de sección vacía; por eso hace falta el
  flag estructural, no basta con devolver `[]`.
- **Alternativas consideradas**: dejar los ceros. Rechazada explícitamente por el spec
  (Clarifications 2026-09-28: "Omitir todo").

**D6 — Alineación del recordatorio manual.**

- **Decision**: `SendReminders.usecase.ts` reemplaza `if (!disclaimerText) return` por
  `if (!hasDisclaimerText(disclaimerText)) return`. Mantiene el resto del flujo (cross-domain
  `GetEmailsByUsersId`, `OwnersysRepository`, batch de 50) sin cambios.
- **Rationale**: FR-007 y la Clarification piden que el texto solo-espacios también bloquee, tomando
  el bloqueo actual como referencia. Este archivo es el **precedente documentado** del guard de negocio.

**D7 — Frontend: ocultar, no reemplazar.**

- **Decision**: la bandera `hasDisclaimerText` gobierna:
  1. La inclusión de la columna `estado_firma` ("Términos firmados") en `EmpleadosColumns`.
  2. El bloque "Términos firmados" en `EmployeeCards`.
  3. La card "Aceptación de términos" en `StatisticsEmpleados` y el cómputo de `dataChartEstadoFirma`.
  4. La preselección por términos en `handleActivateSelection`.
- **Rationale**: `frontend-design.md` reglas 1-3: ocultar por completo, sin estado "No aplica" ni copy,
  colapsando el layout (grilla de estadísticas de 3 → 2 columnas). La bandera es la única entrada.

### Mapeo brief ↔ código real (discrepancia a tener en cuenta)

El brief menciona un "gráfico 'Estado de firma'" (donut). En el código real
`Admin/Components/StatisticsEmpleados.tsx` **no renderiza un donut** de estado de firma: renderiza
tres _stat cards_ (`Empleados`, `Renovar clave`, `Aceptación de términos`). El insumo
`dataChartEstadoFirma` (proveniente de `useGetStatisticsEmpleados`) se usa para calcular los conteos
de la card **"Aceptación de términos"**. Por lo tanto, la superficie a ocultar es esa **card**
(y omitir el cálculo de `dataChartEstadoFirma`), y la grilla debe colapsar de `md:grid-cols-3` a
`md:grid-cols-2`. Se documenta para que la implementación no busque un componente de donut inexistente.

### Estado de la infraestructura de datos (confirmación)

| Hecho                                                                             | Evidencia                                                                                                                                               |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| El texto vive en `Sis_propietarios.texto_disclaimer` (`TEXT`, nullable)           | `Ownersys/Infrastructure/Database/Ownersys.model.ts` (`tableName: 'Sis_propietarios'`, `texto_disclaimer` allowNull)                                    |
| Se lee vía `OwnersysRepository.getOwnersys`                                       | `Disclaimer/Application/UseCases/GetDisclaimerText.usecase.ts`, `SendReminders.usecase.ts`                                                              |
| `CompaniesModel` también mapea `Sis_propietarios` pero **sin** `texto_disclaimer` | `Companies/Infrastructure/Database/Companies.model.ts`, `UsersRepository.getAllActiveOwners`                                                            |
| El login ya aplica `Boolean(texto?.trim())`                                       | `Auth/Application/UseCases/Login.usecase.ts` L70-72; test `Login.usecase.spec.ts` "does NOT set pendingDisclaimer when company has no texto_disclaimer" |
| No hay cambios de schema necesarios                                               | spec Assumptions + modelos existentes                                                                                                                   |

## Decisiones resumidas

| #   | Decisión                                                                           | Archivo(s) clave                                                                                                                                         |
| --- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | Helper `hasDisclaimerText` en `Infrastructure/utils/`                              | `Infrastructure/utils/disclaimerUtils.ts`, `Infrastructure/index.ts`                                                                                     |
| D2  | Use case `HasDisclaimerText` (Disclaimer, owner-scoped, reusa `GetDisclaimerText`) | `Disclaimer/Application/UseCases/HasDisclaimerText.usecase.ts`, `disclaimer.di.ts`                                                                       |
| D3  | Contract `disclaimer.hasText` → `boolean` + hook único en Admin                    | `Disclaimer.controller.ts`, `Disclaimer.routes.ts`, `Admin/Hooks/useHasDisclaimerText.ts`                                                                |
| D4  | Gate por dominio (EmployeeReminders / Disclaimer queries / DailyReport)            | `GenerateDailyReminder.usecase.ts`, `GetPendingDisclaimerAcceptances.usecase.ts`, `CountPendingDisclaimers.usecase.ts`, `GenerateDailyReport.usecase.ts` |
| D5  | `hasDisclaimerText` en `IDailyReport` + omisión en template                        | `DailyReport.types.ts`, `DailyReport.entity.ts`, `Templates/types.ts`, `dailyReport.template.ts`                                                         |
| D6  | `SendReminders` alineado a `.trim()`                                               | `SendReminders.usecase.ts`                                                                                                                               |
| D7  | Frontend oculta columna/bloque/card/preselección desde la bandera                  | `EmpleadosColumns.tsx`, `EmployeeCards.tsx`, `StatisticsEmpleados.tsx`, `useGetStatisticsEmpleados.ts`, `useEmpleadosPage.ts`, `Empleados.page.tsx`      |
