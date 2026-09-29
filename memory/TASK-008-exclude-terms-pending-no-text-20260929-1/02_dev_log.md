---
task_id: 'TASK-008-exclude-terms-pending-no-text-20260929-1'
agent: 'Front_Agent'
status: 'IMPLEMENTED'
attempts: 2
date: '2026-09-29'
affected_files:
  - packages/server/src/Infrastructure/utils/disclaimerUtils.ts
  - packages/server/src/domains/Disclaimer/Application/UseCases/HasDisclaimerText.usecase.ts
  - packages/server/src/Infrastructure/index.ts
  - packages/server/src/Infrastructure/utils/Email/Templates/types.ts
  - packages/server/src/Infrastructure/utils/Email/Templates/dailyReport.template.ts
  - packages/server/src/domains/Auth/Application/UseCases/Login.usecase.ts
  - packages/server/src/domains/Disclaimer/Application/Disclaimer.service.ts
  - packages/server/src/domains/Disclaimer/Application/UseCases/index.ts
  - packages/server/src/domains/Disclaimer/Application/UseCases/CountPendingDisclaimers.usecase.ts
  - packages/server/src/domains/Disclaimer/Application/UseCases/GetPendingDisclaimerAcceptances.usecase.ts
  - packages/server/src/domains/Disclaimer/Application/UseCases/SendReminders.usecase.ts
  - packages/server/src/domains/Disclaimer/Infrastructure/Controllers/Disclaimer.controller.ts
  - packages/server/src/domains/Disclaimer/Infrastructure/Routes/Disclaimer.routes.ts
  - packages/server/src/domains/Disclaimer/disclaimer.di.ts
  - packages/server/src/domains/EmployeeReminders/Application/UseCases/GenerateDailyReminder.usecase.ts
  - packages/server/src/domains/DailyReport/Domain/DailyReport.types.ts
  - packages/server/src/domains/DailyReport/Domain/DailyReport.entity.ts
  - packages/server/src/domains/DailyReport/Application/UseCases/GenerateDailyReport.usecase.ts
  - packages/server/src/domains/DailyReport/Application/UseCases/GenerateDailyReportStub.usecase.ts
  - packages/server/src/domains/DailyReport/Domain/specs/DailyReport.entity.spec.ts
  - packages/server/src/domains/DailyReport/Application/UseCases/specs/dailyReport.fixtures.ts
  - packages/server/src/domains/DailyReport/Application/UseCases/specs/GenerateDailyReport.usecase.spec.ts
  - packages/server/src/domains/Disclaimer/Application/UseCases/specs/GetPendingDisclaimerAcceptances.usecase.spec.ts
  - packages/server/src/domains/EmployeeReminders/Application/UseCases/specs/GenerateDailyReminder.usecase.spec.ts
  - docs/email-notifications.md
  - packages/app/src/Domains/Admin/Hooks/useHasDisclaimerText.ts
  - packages/app/src/Domains/Admin/Hooks/index.ts
  - packages/app/src/Domains/Admin/Components/EmpleadosColumns.tsx
  - packages/app/src/Domains/Admin/Components/EmployeeCards.tsx
  - packages/app/src/Domains/Admin/Hooks/useGetStatisticsEmpleados.ts
  - packages/app/src/Domains/Admin/Hooks/useEmpleadosPage.ts
  - packages/app/src/Domains/Admin/Components/StatisticsEmpleados.tsx
  - packages/app/src/Domains/Admin/Pages/Empleados.page.tsx
---

# Log de Desarrollo — Sin texto de términos no existe pendiente de aceptación

## Cambios

- `packages/server/src/Infrastructure/utils/disclaimerUtils.ts` — **nuevo**: helper único `hasDisclaimerText(text?: string | null): boolean` con `Boolean(text?.trim())`; cubre `null`, `undefined`, `''` y solo espacios/tabs/saltos (FR-001).
- `packages/server/src/Infrastructure/index.ts` — exporta el helper desde el barrel `@server/Infrastructure` (T002).
- `packages/server/src/domains/Auth/Application/UseCases/Login.usecase.ts` — usa el helper compartido en lugar de `Boolean(...trim())`; sin cambio de comportamiento (T003).
- `packages/server/src/domains/Disclaimer/Application/UseCases/HasDisclaimerText.usecase.ts` — **nuevo**: use case `HasDisclaimerText` owner-scoped desde `RequestContext.values.ownerId`, reutiliza `GetDisclaimerText` vía `executeUseCase` (T004).
- `packages/server/src/domains/Disclaimer/Application/UseCases/index.ts` — exporta `HasDisclaimerText` (T005).
- `packages/server/src/domains/Disclaimer/Application/Disclaimer.service.ts` — método `hasDisclaimerText({ requestContext })` que delega en `_hasDisclaimerText` (T006).
- `packages/server/src/domains/Disclaimer/Infrastructure/Controllers/Disclaimer.controller.ts` — procedure `hasText` (query `protectedProcedure`, sin `.input()`, `executeServiceAlone`) (T007).
- `packages/server/src/domains/Disclaimer/Infrastructure/Routes/Disclaimer.routes.ts` — expone `disclaimer.hasText` (T008).
- `packages/server/src/domains/Disclaimer/disclaimer.di.ts` — registra `_hasDisclaimerText: asClass(HasDisclaimerText)` (T009).
- `packages/server/src/domains/EmployeeReminders/Application/UseCases/GenerateDailyReminder.usecase.ts` — inyecta `_hasDisclaimerText`, computa `hasTerms` una vez por empresa y aplica `hasTerms && employee.estado_firma !== 'Firmado'`; `EmployeeReminder.shouldSend` intacto (T010).
- `packages/server/src/domains/DailyReport/Domain/DailyReport.types.ts` — `hasDisclaimerText: boolean` en `IDailyReport` (T011).
- `packages/server/src/Infrastructure/utils/Email/Templates/types.ts` — espeja `hasDisclaimerText: boolean` en el contrato del template (T012).
- `packages/server/src/domains/Disclaimer/Application/UseCases/GetPendingDisclaimerAcceptances.usecase.ts` — inyecta `_hasDisclaimerText` y devuelve `[]` sin texto, antes del repo (T013).
- `packages/server/src/domains/Disclaimer/Application/UseCases/CountPendingDisclaimers.usecase.ts` — inyecta `_hasDisclaimerText` y devuelve `0` sin texto; propaga el 0 al resumen (T014).
- `packages/server/src/domains/DailyReport/Domain/DailyReport.entity.ts` — propaga `hasDisclaimerText` en `create(...)` y `values` (T015).
- `packages/server/src/domains/DailyReport/Application/UseCases/GenerateDailyReportStub.usecase.ts` — puebla `hasDisclaimerText: true` (T016).
- `packages/server/src/domains/DailyReport/Application/UseCases/GenerateDailyReport.usecase.ts` — inyecta `_hasDisclaimerText` y puebla `report.hasDisclaimerText` (T017).
- `packages/server/src/Infrastructure/utils/Email/Templates/dailyReport.template.ts` — omite por completo (sin ceros ni sección vacía) la fila "Términos sin aceptar" y la sección detallada cuando `hasDisclaimerText === false` (T018).
- `packages/server/src/domains/Disclaimer/Application/UseCases/SendReminders.usecase.ts` — guard `hasDisclaimerText(disclaimerText)` → `{ sent: 0, failed: 0, total: 0 }` (T027).
- `docs/email-notifications.md` — §5 y §6 documentan el gate por texto de términos compartido (T028).

### Specs preexistentes adaptados (NO eran tareas asignadas)

Se adaptaron a las nuevas firmas de constructor / nuevas propiedades de tipos para mantener el typecheck verde. La lógica de negocio no se tocó; `@blendverse-tester` generará los casos nuevos.

- `packages/server/src/domains/DailyReport/Domain/specs/DailyReport.entity.spec.ts` — `hasDisclaimerText: true` en `reportProps`.
- `packages/server/src/domains/DailyReport/Application/UseCases/specs/dailyReport.fixtures.ts` — `hasDisclaimerText: true` en `DailyReport.create`.
- `packages/server/src/domains/DailyReport/Application/UseCases/specs/GenerateDailyReport.usecase.spec.ts` — mock `hasDisclaimerText` + 8º argumento en las 4 construcciones.
- `packages/server/src/domains/Disclaimer/Application/UseCases/specs/GetPendingDisclaimerAcceptances.usecase.spec.ts` — 2º argumento (mock `hasDisclaimerText` resolviendo `true`).
- `packages/server/src/domains/EmployeeReminders/Application/UseCases/specs/GenerateDailyReminder.usecase.spec.ts` — mock `hasDisclaimerText` + 3er argumento en las 6 construcciones.

## Decisiones técnicas

- **Una sola fuente de verdad**: `hasDisclaimerText` centraliza la definición de "sin texto"; Login, SendReminders, EmployeeReminders y DailyReport la consumen (FR-007/SC-006).
- **Cross-domain por caso de uso (Principio VII)**: `hasDisclaimerText` se computa por empresa y se inyecta como dependencia (`_hasDisclaimerText`) o se resuelve vía `HasDisclaimerText` dentro de los use cases de Disclaimer; nunca se importa el repositorio de otro dominio.
- **Gate temprano sin tocar consumidores**: `GetPendingDisclaimerAcceptances` → `[]` y `CountPendingDisclaimers` → `0` hacen que `GetStatisticalSummary` y `GenerateDailyReport` propaguen el resultado correcto sin modificarse (FR-005).
- **Template auto-explicativo**: el flag `hasDisclaimerText` viaja en `IDailyReport` hasta el template; no se infiere en el frontend (anti-requisito del contrato).
- **Sin cambios de modelo ni migraciones**: `Sis_propietarios.texto_disclaimer` ya existía.
- **Imports concretos dentro de `Infrastructure/**`**: `disclaimerUtils.ts`y`dailyReport.template.ts`no importan el barrel`@server/Infrastructure` (evita ciclos).
- **Specs preexistentes adaptados, no generados**: cambios mínimos de firma/mock; no se agregó cobertura nueva (responsabilidad de `@blendverse-tester`).

## Cambios (Frontend — US4)

- `packages/app/src/Domains/Admin/Hooks/useHasDisclaimerText.ts` — **nuevo**: consume `AdminDisclaimerService.hasText.useQuery()` (procedure `disclaimer.hasText`, sin input, owner desde `RequestContext`) y expone `{ hasDisclaimerText (default false), isLoading }` (T019).
- `packages/app/src/Domains/Admin/Hooks/index.ts` — exporta `useHasDisclaimerText` (T020).
- `packages/app/src/Domains/Admin/Components/EmpleadosColumns.tsx` — `hasDisclaimerText: boolean` en `EmployeeColumnsOptions`; la columna `estado_firma` ("Términos firmados") solo se agrega cuando hay texto (T021).
- `packages/app/src/Domains/Admin/Components/EmployeeCards.tsx` — prop `hasDisclaimerText`; el bloque "Términos firmados" solo se renderiza cuando hay texto (T022).
- `packages/app/src/Domains/Admin/Hooks/useGetStatisticsEmpleados.ts` — recibe `hasDisclaimerText`; `dataChartEstadoFirma` retorna `[]` cuando no hay texto, sin computar conteos (T023).
- `packages/app/src/Domains/Admin/Hooks/useEmpleadosPage.ts` — consume `useHasDisclaimerText`, expone `hasDisclaimerText`, lo pasa a `employeeColumns(...)`, gatea `handleActivateSelection` (sin preselección por `estado_firma` sin texto) e incluye el `isLoading` de la bandera en el `isLoading` de la página (T024).
- `packages/app/src/Domains/Admin/Components/StatisticsEmpleados.tsx` — prop `hasDisclaimerText`, se la pasa a `useGetStatisticsEmpleados`; oculta la stat card "Aceptación de términos" y usa `md:grid-cols-2` en vez de `md:grid-cols-3` sin texto (T025).
- `packages/app/src/Domains/Admin/Pages/Empleados.page.tsx` — obtiene `hasDisclaimerText` de `useEmpleadosPage` y lo pasa por prop a `StatisticsEmpleados` y `EmployeeCards` (T026).

### Decisiones técnicas (Frontend)

- **Bandera única desde el backend**: el frontend no deriva ni infiere la condición; consume `disclaimer.hasText` y solo decide visibilidad (anti-requisito del contrato).
- **Sin cambios en `getEmployees`**: `estado_firma` puede seguir diciendo "Pendiente" en la respuesta; la UI lo oculta y lo excluye de la preselección.
- **Sin copy/estado "No aplica"**: cuando no hay texto se omite la superficie, no se reemplaza por un estado alternativo (FR-011/FR-012).
- **Empresa con texto**: render y conteos idénticos al comportamiento actual (sin regresión, SC-004/SC-007/SC-008).

## Deuda técnica

- Sin deuda técnica registrada. Cobertura de los nuevos casos de negocio (gate por empresa en empleados/reporte y guard de solo-espacios en recordatorio manual) pendiente de `@blendverse-tester`.
- `packages/server/dist` se regeneró como artefacto de build (gitignoreado) para que el `tsc` de la app resolviera las declaraciones frescas de `disclaimer.hasText`; no es un archivo fuente afectado.
