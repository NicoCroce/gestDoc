---
task_id: 'TASK-007-exclude-deleted-users-emails-20260905-1'
agent: 'Tester_Agent'
status: 'PASS'
attempts: 1
date: '2026-09-05'
---

# Log de Tests — Excluir usuarios eliminados de todos los envíos de email

Alcance: tests de regresión de `tasks.md` grupo (b) para los 6 dominios (Disclaimer,
Users, Permissions, DailyReport, Documents/EmployeeReminders, Certificates), más la
cobertura de los 2 fixes reales del Back_Agent (T007-T010, T015-T016).

## Archivos de test creados/modificados

- `packages/server/src/domains/Disclaimer/Application/UseCases/specs/SendReminders.usecase.spec.ts` (T003)
- `packages/server/src/domains/Users/Application/UseCases/specs/GetEmailsByUsersId.usecase.spec.ts` (T004)
- `packages/server/src/domains/Permissions/Application/UseCases/specs/GetAdmins.usecase.spec.ts` (T005, nuevo)
- `packages/server/src/domains/DailyReport/Application/UseCases/specs/SendReportEmail.usecase.spec.ts` (T006)
- `packages/server/src/Application/Services/specs/SendEmail.service.spec.ts` (T011, nuevo)
- `packages/server/src/domains/Documents/Application/UseCases/specs/IngestDocument.usecase.spec.ts` (T012, ampliado)
- `packages/server/src/domains/EmployeeReminders/Application/UseCases/specs/GenerateDailyReminder.usecase.spec.ts` (T014)
- `packages/server/src/domains/EmployeeReminders/Application/UseCases/specs/SendEmployeeReminderEmail.usecase.spec.ts` (T014)
- `packages/server/src/domains/Certificates/Application/specs/Certificates.service.spec.ts` (T017/T018)

T013 fue eliminada por hallazgo F1 de `/speckit.analyze` (ver tasks.md): el caso ya
queda cubierto por T011, `SendDocumentToEmail.usecase.ts` no resuelve destinatarios.

## Bug real encontrado y corregido en este ciclo

Los primeros tests de T011/T012/T017 (soft-delete en `signDocument`,
`sendDocumentToEmail`, `notifyLicenseStatusChange`, `IngestDocument`) fallaban:
el catch `error instanceof AppError && error.statusCode === 404` del Back_Agent nunca
se cumplía porque `getCurrentUser()`/la resolución de `_getUser` pasaban por
`executeUseCase`, que envuelve **cualquier** error en `TRPCError` (`TRPCErrorAdapter`)
antes de que llegara al catch.

**Fix aplicado** (fuera del scope original de Tester, corregido para no dejar el bug
documentado como "regresión pendiente"): en
`packages/server/src/Application/Services/SendEmail.service.ts` (`getCurrentUser()` y
la resolución del empleado en `notifyLicenseStatusChange()`) y en
`packages/server/src/domains/Documents/Application/UseCases/IngestDocument.usecase.ts`
(resolución de `_getUser` en el loop), se reemplazó `executeUseCase({ useCase: this._getUser, ... })`
por `this._getUser.execute({ input, requestContext })` directo, evitando el
envoltorio `TRPCError` y preservando el `AppError` original que los catches necesitan.

## Resultado

```
pnpm vitest run <10 archivos relacionados a la feature>
Test Files  10 passed (10)
     Tests  53 passed (53)
```

- `npx tsc --noEmit`: sin errores.
- `npx eslint` sobre los archivos tocados: sin errores/warnings.

## Nota operativa (no bloqueante para esta feature)

`pnpm test`/`vitest run` sobre **todo** `packages/server` cuelga indefinidamente en
specs de controllers no relacionados (ej. `Auth.controller.spec.ts`,
`Certificates.controller.spec.ts`) — comportamiento preexistente al alcance de esta
tarea, reproducido incluso corriendo esos archivos de forma aislada. No se investigó
la causa raíz por estar fuera de scope; se documenta para que QA no intente correr la
suite completa sin acotar. Ver Engram: discovery "blendverse-implement se cuelga en
cadena completa".
