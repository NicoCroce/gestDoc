---
task_id: 'TASK-008-exclude-terms-pending-no-text-20260929-1'
agent: 'Reviewer_Agent'
status: 'APPROVED'
attempts: 1
date: '2026-09-29'
---

# Revisión — Sin texto de términos no existe pendiente de aceptación

Resultado: APPROVED · ítems revisados: 17 · 🔴 fallidos: ninguno

## Alcance revisado

`affected_files` de `memory/TASK-008-exclude-terms-pending-no-text-20260929-1/02_dev_log.md` (server + app), contrastados con `specs/008-exclude-terms-pending-no-text/spec.md` y `tasks.md`.

**Server**

- `packages/server/src/Infrastructure/utils/disclaimerUtils.ts`
- `packages/server/src/domains/Disclaimer/Application/UseCases/HasDisclaimerText.usecase.ts`
- `packages/server/src/Infrastructure/index.ts`
- `packages/server/src/Infrastructure/utils/Email/Templates/types.ts`
- `packages/server/src/Infrastructure/utils/Email/Templates/dailyReport.template.ts`
- `packages/server/src/domains/Auth/Application/UseCases/Login.usecase.ts`
- `packages/server/src/domains/Disclaimer/Application/Disclaimer.service.ts`
- `packages/server/src/domains/Disclaimer/Application/UseCases/index.ts`
- `packages/server/src/domains/Disclaimer/Application/UseCases/CountPendingDisclaimers.usecase.ts`
- `packages/server/src/domains/Disclaimer/Application/UseCases/GetPendingDisclaimerAcceptances.usecase.ts`
- `packages/server/src/domains/Disclaimer/Application/UseCases/SendReminders.usecase.ts`
- `packages/server/src/domains/Disclaimer/Infrastructure/Controllers/Disclaimer.controller.ts`
- `packages/server/src/domains/Disclaimer/Infrastructure/Routes/Disclaimer.routes.ts`
- `packages/server/src/domains/Disclaimer/disclaimer.di.ts`
- `packages/server/src/domains/EmployeeReminders/Application/UseCases/GenerateDailyReminder.usecase.ts`
- `packages/server/src/domains/DailyReport/Domain/DailyReport.types.ts`
- `packages/server/src/domains/DailyReport/Domain/DailyReport.entity.ts`
- `packages/server/src/domains/DailyReport/Application/UseCases/GenerateDailyReport.usecase.ts`
- `packages/server/src/domains/DailyReport/Application/UseCases/GenerateDailyReportStub.usecase.ts`

**App**

- `packages/app/src/Domains/Admin/Hooks/useHasDisclaimerText.ts`
- `packages/app/src/Domains/Admin/Hooks/index.ts`
- `packages/app/src/Domains/Admin/Components/EmpleadosColumns.tsx`
- `packages/app/src/Domains/Admin/Components/EmployeeCards.tsx`
- `packages/app/src/Domains/Admin/Hooks/useGetStatisticsEmpleados.ts`
- `packages/app/src/Domains/Admin/Hooks/useEmpleadosPage.ts`
- `packages/app/src/Domains/Admin/Components/StatisticsEmpleados.tsx`
- `packages/app/src/Domains/Admin/Pages/Empleados.page.tsx`

## Verificación por ítem

Chequeos mecánicos primero (un solo grep sobre los `affected_files`): `: any\b|as any|<any>` → sin coincidencias; `console\.` → 1 coincidencia preexistente (ver Deuda técnica).

**Backend / arquitectura**

1. 🔴 `Domain/` no importa de `Application/`/`Infrastructure/` — OK. Ningún archivo de `Domain/` entre los afectados importa capas superiores.
2. 🔴 Use cases dependen de la interfaz del repositorio — OK. `GetPendingDisclaimerAcceptances` y `CountPendingDisclaimers` reciben `DisclaimerRepository` (abstracción), no la implementación.
3. 🔴 Dominio nuevo en `register.ts`/`Router.ts` — N/A: no se introduce dominio nuevo. `hasText` se expone vía `Disclaimer.routes.ts` y queda dentro de `TDisclaimerRouter` (`ReturnType<typeof _DisclaimerRouter>`).
4. 🔴 Sin `any` explícito — OK (grep sin coincidencias).
5. 🟡 Métodos públicos con tipo de retorno explícito — OK. `DisclaimerService.hasDisclaimerText(...): Promise<boolean>`; `HasDisclaimerText.execute(...): Promise<boolean>`.
6. 🔴 Entre capas solo interfaces/tipos — OK. `HasDisclaimerText` (Application) reutiliza `GetDisclaimerText` (mismo dominio) por caso de uso; no se comparten clases concretas entre capas.
7. 🔴 Input validado — OK. `hasText` es query `protectedProcedure` **sin `.input()`** (owner desde `RequestContext`), conforme al diseño; no agrega inputs.
8. 🔴 Query de repositorio filtra por `ownerId` — OK. `HasDisclaimerText` es owner-scoped desde `requestContext.values.ownerId` y lo pasa a `GetDisclaimerText`; los gates cortan antes del repositorio. No se agregan queries sin filtro.
9. 🟡 Sin `console.*` — ver Deuda técnica (preexistente, no introducido).
10. 🔴 Naming según instrucciones — OK.
11. 🟡 Entidad con `static create()`, `toJSON()` y `get values()` — OK (`DailyReport.entity.ts`).

**Frontend** 12. 🔴 Estados de pantalla — OK. `Empleados.page.tsx`: `isError` → `EmptyScreenError`, `isLoading` → `TableSkeleton`/`CardsSkeleton`, vacío → `EmpleadosEmptyState`; `useEmpleadosPage` incorpora `isLoadingHasDisclaimerText` al `isLoading` de página. 13. 🔴 Sin texto suelto para estados ni fallbacks inalcanzables — OK. 14. 🔴 Botones de mutation con `isLoading={isPending}` — OK (`Empleados.page.tsx`, botón Confirmar). 15. 🟡 Empty states sobre `EmptyState` — OK (sin cambios en el patrón existente). 16. 🟡 Skeletons en `Components/` del dominio — OK. 17. 🟡 Barrel `index.ts` sin implementaciones privadas — OK (`Hooks/index.ts`, `UseCases/index.ts` reexportan solo lo público).

## Reglas de negocio verificadas

- **Fuente única de `hasDisclaimerText`** (FR-001/FR-007): helper `Boolean(text?.trim())` en `disclaimerUtils.ts`, consumido por `Login.usecase.ts:71`, `SendReminders.usecase.ts:38`, y vía el use case `HasDisclaimerText` en `GenerateDailyReminder.usecase.ts:50`, `GetPendingDisclaimerAcceptances.usecase.ts:29`, `CountPendingDisclaimers.usecase.ts:22` y `GenerateDailyReport.usecase.ts:71`.
- **Gate por empresa en `GenerateDailyReminder`** (FR-002/FR-008): `hasTerms` se computa **una vez por empresa** antes del loop (`:50-53`) y se aplica como `hasTerms && employee.estado_firma !== 'Firmado'` (`:108-109`); `EmployeeReminder.shouldSend` no se modifica. Si el pendiente de términos era el único, `shouldSend` es `false` y no se envía correo (FR-004).
- **Gate temprano en Disclaimer** (FR-005/FR-009): `GetPendingDisclaimerAcceptances` → `[]` (`:34-36`) y `CountPendingDisclaimers` → `0` (`:27-29`) **antes** de consultar el repositorio; `GetStatisticalSummary` propaga el `0` sin cambios.
- **Flag propagado al template** (FR-005/SC-002): `hasDisclaimerText` en `IDailyReport` (`types.ts:126`), `DailyReport.entity` (`:13/21/28/41`), poblado en `GenerateDailyReport` (`:78`) y presente en `report.values` consumido por `SendReportEmail`. `dailyReport.template.ts` omite **por completo** la fila del resumen (`:39-46`) y la sección detallada (`:99-108`) cuando es `false`, sin ceros ni secciones vacías.
- **Correo de empleado** (FR-003): `employeeDailyReminder.template.ts:35` ya condiciona la sección de términos a `pending.pendingDisclaimerAcceptance`; el flag en `false` la elimina y, sin otros pendientes, no se emite correo.
- **Frontend** (FR-011/FR-012/FR-013): `useHasDisclaimerText` consume `disclaimer.hasText` sin inferir la condición (default `false`); se gatea la columna `estado_firma` (`EmpleadosColumns.tsx:106`), el bloque de tarjeta (`EmployeeCards.tsx:72`), la stat card y la grilla `md:grid-cols-2` (`StatisticsEmpleados.tsx:63/35`) y la preselección (`useEmpleadosPage.ts:74-81`). Sin copy alternativo "No aplica".
- **Cross-domain** (Principio VII): `_hasDisclaimerText` inyectado por DI (`disclaimer.di.ts`) y consumido por caso de uso; nunca se importa el repositorio de otro dominio.
- **Con texto configurado**: comportamiento sin cambios (SC-004/SC-006/SC-007/SC-008).

## Feedback (solo si REJECTED)

N/A — sin ítems 🔴 fallidos.

## Deuda técnica (🟡)

- **Ítem 9** — `packages/server/src/domains/Disclaimer/Application/UseCases/SendReminders.usecase.ts:71`: `console.log(error)` en el `catch`. **Preexistente** (confirmado por `git diff`: el cambio solo agrega el import del helper y el guard). Recomendado migrar a `logger.warn`/logger del proyecto si se busca consistencia; no bloquea.
- **Ítem 9 / trazabilidad** — nuevos specs sin trackear: `packages/app/src/Domains/Admin/Hooks/specs/` (`useHasDisclaimerText.spec.tsx`, `useEmpleadosPage.spec.tsx`, `useGetStatisticsEmpleados.spec.tsx`) y `packages/server/src/Infrastructure/utils/Email/Templates/specs/` (`dailyReport.template.spec.ts`) no figuran en `affected_files` del dev log. Hueco menor de trazabilidad, a cargo de `@blendverse-tester`; no bloquea.
