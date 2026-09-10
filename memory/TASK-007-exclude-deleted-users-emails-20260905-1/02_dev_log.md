---
task_id: 'TASK-007-exclude-deleted-users-emails-20260905-1'
agent: 'Back_Agent'
status: 'IMPLEMENTED'
attempts: 1
date: '2026-09-05'
affected_files:
  - 'packages/server/src/Application/Services/SendEmail.service.ts'
  - 'packages/server/src/domains/Documents/Application/UseCases/IngestDocument.usecase.ts'
---

# Log de Desarrollo — Excluir usuarios eliminados de todos los envíos de email (fixes reales)

Alcance de esta sesión: solo los fixes de código de `tasks.md` Fase 5/6 (T007–T010,
T015–T016). No se generaron tests (responsabilidad de `@blendverse-tester`). No se auditaron
ni modificaron los flujos ya conformes (Disclaimer, DailyReport, Permissions,
EmployeeReminders) porque `research.md` confirmó que no requieren cambio de código.

## Archivos Modificados

| Archivo                                                                                | Cambio aplicado                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/server/src/Application/Services/SendEmail.service.ts`                        | **T007** (Gap 2, bloque admins de `signDocument`): `if (admins)` → `if (admins.length > 0)`, con `else` que loguea `'Document signing email to admins skipped: no active admins found'`. **T008** (Gap 1, `sendDocumentToEmail`): catch distingue `AppError` con `statusCode === 404` (usuario no resuelto/soft-deleted) del resto de errores, logueando `'Document email skipped: recipient not active'` y sin relanzar. **T009** (Gap 1, empleado en `signDocument`): mismo tratamiento explícito en el catch existente (`'Document signing email skipped: recipient not active'`); no requirió catch separado porque `GetAdmins` nunca lanza `AppError` con `statusCode 404` (usa el default 500), por lo que el `instanceof AppError && statusCode === 404` dentro del único catch del método aísla sin ambigüedad el caso del empleado. **T015** (Gap 2, `sendEmailToAdmins`, usado por `addLincence`): mismo fix que T007, log `'Email to admins skipped: no active admins found'`. **T016** (Gap 1, `notifyLicenseStatusChange`): mismo patrón de catch explícito, log `'License status email skipped: employee not active'`. Se agregó `AppError` al import ya existente desde `../Entities`. |
| `packages/server/src/domains/Documents/Application/UseCases/IngestDocument.usecase.ts` | **T010** (Gap 1, loop por `employeeId`): el catch ahora distingue `error instanceof AppError && error.statusCode === 404` (empleado no resuelto/soft-deleted vía `GetUser`) del resto de errores inesperados — loguea `'Document notification skipped: employee not active'` en el primer caso (en vez del genérico `'New document notification skipped (ingest continues)'`) y continúa el loop sin bloquear la creación del documento (`created`/`documentIds` no se ven afectados). Se agregó `AppError` al import ya existente desde `@server/Application`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |

## Decisiones Técnicas

- **Reutilizar el código de error de `GetUser` (`AppError 404`) como señal explícita**: en vez
  de introducir un nuevo método/flag "is user active", se usa `instanceof AppError &&
error.statusCode === 404` en el catch de cada consumidor. `GetUser.execute()` ya lanza ese
  código específico cuando el repositorio devuelve `null` (soft-deleted o inexistente, mismo
  caso por el `paranoid: true` de `UserModel`), y ningún otro use case invocado en los mismos
  bloques `try` (`GetAdmins`) usa ese código (usa el `AppError` default de `statusCode 500`),
  por lo que el chequeo es inequívoco sin necesitar catches anidados por operación.
- **`signDocument()` mantiene un único `try/catch`**: T007 (bloque admins) y T009 (empleado)
  se resolvieron dentro del mismo catch existente, sin separarlo en dos bloques, porque el
  chequeo `statusCode === 404` ya aísla el caso "empleado no activo" sin falsos positivos
  provenientes de `GetAdmins` o de fallos de `mailNotificationService`.
- **`return` temprano en el catch, no relanzar**: en los 3 métodos de `SendEmailService`
  (T008, T009, T016) y en el `continue` de T010, el caso "recipiente no activo" nunca
  propaga la excepción hacia el caller — cumple FR-006/SC-003 (la operación de negocio
  subyacente, ej. cambio de estado de licencia o ingesta de documento, nunca se bloquea).
- **No se tocó `Users.model.ts` ni ninguna query Sequelize**: los 6 fixes son puramente de
  control de flujo (condición `admins.length > 0` y discriminación de error en catch), sin
  cambios de schema ni de queries, conforme a la restricción de la spec (FR-007/FR-008).

## Verificación

- `npx tsc --noEmit -p tsconfig.json` (desde `packages/server`): sin errores.
- `npx eslint` sobre ambos archivos modificados: sin warnings/errores.
- `npx vitest run` sobre `src/Application/Services` (sin specs previos) y
  `IngestDocument.usecase.spec.ts` (5 tests existentes): **5 passed**, sin regresión.

## Deuda Técnica Conocida

Sin deuda técnica registrada. Los tests de regresión de estos 6 fixes (T011, T012, T017)
quedan a cargo de `@blendverse-tester` según el alcance definido en `tasks.md`.
