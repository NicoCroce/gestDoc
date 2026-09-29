---
task_id: 'TASK-008-exclude-terms-pending-no-text-20260929-1'
agent: 'Tester_Agent'
status: 'PASS'
attempts: 1
date: '2026-09-29'
---

# Tests — Sin texto de términos no existe pendiente de aceptación (008)

## Specs

### Server

- `packages/server/src/Infrastructure/utils/specs/disclaimerUtils.spec.ts` — 4 casos: `hasDisclaimerText` con `null`/`undefined`/`''` → false; solo espacios/tabs/saltos → false; texto real (incluido con padding) → true (FR-001).
- `packages/server/src/domains/Disclaimer/Application/UseCases/specs/HasDisclaimerText.usecase.spec.ts` — 4 casos: resuelve el texto desde `RequestContext.values.ownerId` (owner 42) y delega en `GetDisclaimerText` con `{ input: ownerId, requestContext }`; solo espacios → false; vacío → false; multi-tenant: owner 42 con texto vs owner 77 sin texto, cada uno resuelve su propio owner sin filtrar al otro (FR-008).
- `packages/server/src/domains/Disclaimer/Application/UseCases/specs/CountPendingDisclaimers.usecase.spec.ts` — 2 casos: con texto delega en `countPendingDisclaimers` con el `requestContext`; sin texto devuelve `0` sin tocar el repositorio (FR-005).
- `packages/server/src/domains/Disclaimer/Application/UseCases/specs/GetPendingDisclaimerAcceptances.usecase.spec.ts` — 4 casos (2 nuevos): sin texto devuelve `[]` y no llama a `getEmployeesWithoutDisclaimerAcceptance` (gate temprano); con texto delega y devuelve los registros (FR-005/FR-009).
- `packages/server/src/domains/Disclaimer/Application/UseCases/specs/SendReminders.usecase.spec.ts` — 12 casos (7 nuevos): `undefined`, `'   '`, `'\t\n'`, `' \t \n \r '` → `{ sent: 0, failed: 0, total: 0 }` sin consultar repo ni enviar; texto real con padding → envía preservando el texto crudo y `{ sent: 1, failed: 0, total: 1 }` (FR-007).
- `packages/server/src/domains/EmployeeReminders/Application/UseCases/specs/GenerateDailyReminder.usecase.spec.ts` — 9 casos (3 nuevos, describe "gate por empresa"): `hasTerms` se computa 1 sola vez para 2 empleados; con `hasTerms=false` y `estado_firma='Pendiente'`, `pendingDisclaimerAcceptance=false` y `shouldSend=false` si no hay otros pendientes; con otros pendientes sigue enviando y `pendingDisclaimerAcceptance=false`; con texto (`true`) mantiene el comportamiento actual (`pendingDisclaimerAcceptance=true`, envía) (US1/FR-002/FR-003/FR-004).
- `packages/server/src/domains/DailyReport/Application/UseCases/specs/GenerateDailyReport.usecase.spec.ts` — 6 casos (2 nuevos): propaga `hasDisclaimerText=false` al reporte con sección de términos `{ items: [], totalCount: 0 }` y sin alterar el resto; propaga `true` y conserva los registros (SC-004).
- `packages/server/src/domains/DailyReport/Domain/specs/DailyReport.entity.spec.ts` — 5 casos (1 nuevo): conserva `hasDisclaimerText=false` en `values` y `toJSON()`.
- `packages/server/src/Infrastructure/utils/Email/Templates/specs/dailyReport.template.spec.ts` — 3 casos: con texto renderiza la fila "Términos sin aceptar", su conteo real (8) y la sección detallada con los empleados; sin texto omite por completo fila + sección + cualquier "0" de términos (no aparece la cadena "Términos") sin tocar el resto del reporte; con texto y nadie pendiente mantiene fila con 0 y omite la sección vacía (FR-005/SC-002).

### App

- `packages/app/src/Domains/Admin/Hooks/specs/useHasDisclaimerText.spec.tsx` — 3 casos: consume `disclaimer.hasText.useQuery()` y expone `true`; expone `false`; default `false` mientras `data` es `undefined` con `isLoading=true` (US4).
- `packages/app/src/Domains/Admin/Hooks/specs/useGetStatisticsEmpleados.spec.tsx` — 3 casos: con texto computa `dataChartEstadoFirma` desde `estado_firma` (Firmado=1, Pendiente=2 con sus colores); sin texto devuelve `[]` sin contar pendientes y deja intactos renovación/total; sin empleados `[]` (FR-012).
- `packages/app/src/Domains/Admin/Hooks/specs/useEmpleadosPage.spec.tsx` — 4 casos: preselecciona solo `estado_firma='Pendiente'` con texto (ids 1 y 3); sin texto no preselecciona a nadie; el `isLoading` de la bandera se incluye en el de la página; expone `hasDisclaimerText` (FR-013).

## Fallos

Ninguno. Los specs revelaron una suposición errónea del propio test (la fila de términos del resumen muestra `statisticalSummary.pendingDisclaimerAcceptances`, no `totalCount` de la sección); se corrigió el fixture del test, no el código fuente.

## Comandos

- Server: `../../.opencode/scripts/bash/run-timeout.sh 180 npx vitest related --run <9 specs>` → 9 files / 49 tests passed (sin timeout).
- App: `../../.opencode/scripts/bash/run-timeout.sh 180 npx vitest related --run <3 specs>` → 3 files / 10 tests passed (sin timeout).
