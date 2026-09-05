# PR: Excluir usuarios eliminados (soft-deleted) de todos los envíos de email

## Resumen

Corrige dos puntos donde un usuario/empleado soft-deleted podía romper el envío de notificaciones por email: `SendEmailService` y `IngestDocument` usaban `executeUseCase` para resolver el usuario, lo que envolvía el `AppError` (404) en un `TRPCError` e impedía distinguir "usuario eliminado" de un error real. Ahora ambos invocan el use case directamente, capturan el 404 explícitamente y continúan el flujo (loguear + `continue`/`return`) en vez de abortar el envío completo. Se agregan tests de regresión en 6 dominios para blindar el contrato de exclusión de soft-deleted.

## Archivos modificados

| Archivo                                                                                       | Tipo          | Descripción                                             |
| --------------------------------------------------------------------------------------------- | ------------- | ------------------------------------------------------- |
| `packages/server/src/Application/Services/SendEmail.service.ts`                               | 🔧 Modificado | Bypass de `executeUseCase`, catch de `AppError` 404     |
| `packages/server/src/domains/Documents/Application/UseCases/IngestDocument.usecase.ts`        | 🔧 Modificado | Idem, `continue` por empleado soft-deleted en batch     |
| `packages/server/src/Application/Services/specs/SendEmail.service.spec.ts`                    | ✨ Nuevo      | Suite completa de regresión del servicio de email       |
| `packages/server/src/domains/Documents/.../IngestDocument.usecase.spec.ts`                    | 🔧 Modificado | Casos de empleado soft-deleted en la notificación       |
| `packages/server/src/domains/Permissions/.../GetAdmins.usecase.spec.ts`                       | ✨ Nuevo      | Contrato: admins soft-deleted excluidos, `[]` sin error |
| `packages/server/src/domains/Users/.../GetEmailsByUsersId.usecase.spec.ts`                    | 🔧 Modificado | Contrato: delegación fiel al filtro `paranoid`          |
| `packages/server/src/domains/Certificates/Application/specs/Certificates.service.spec.ts`     | 🔧 Modificado | Regresión de flujo de licencias con usuario eliminado   |
| `packages/server/src/domains/DailyReport/.../SendReportEmail.usecase.spec.ts`                 | 🔧 Modificado | Regresión: reporte diario sin admins activos            |
| `packages/server/src/domains/Disclaimer/.../SendReminders.usecase.spec.ts`                    | 🔧 Modificado | Regresión: recordatorios sin destinatarios activos      |
| `packages/server/src/domains/EmployeeReminders/.../GenerateDailyReminder.usecase.spec.ts`     | 🔧 Modificado | Regresión: generación de recordatorio diario            |
| `packages/server/src/domains/EmployeeReminders/.../SendEmployeeReminderEmail.usecase.spec.ts` | 🔧 Modificado | Regresión: envío a empleado eliminado                   |
| `AGENTS.md`, `.specify/feature.json`                                                          | 🔧 Modificado | Actualización de feature activa de Speckit              |
| `specs/007-exclude-deleted-users-emails/*`                                                    | ✨ Nuevo      | Spec, plan, tasks, research, data-model, contrato       |
| `memory/TASK-007-exclude-deleted-users-emails-20260905-1/*`, `memory/history_log.json`        | ✨ Nuevo/Mod  | Registro del pipeline de agentes de la tarea            |

**Tipos:** ✨ Nuevo · 🔧 Modificado · 🗑️ Eliminado · ♻️ Refactor

## Cambios principales

- **Fix `SendEmailService`:** `getCurrentUser` y la resolución de empleado en `notifyLicenseStatusChange` dejan de pasar por `executeUseCase` (que enmascara el `AppError` como `TRPCError`). Los catches ahora detectan `statusCode === 404` y loguean + abortan solo ese envío, sin propagar el error.
- **Fix `SendEmailService` — listas de admins:** el chequeo `if (admins)` (siempre truthy para un array) se reemplaza por `if (admins.length > 0)`, con warning explícito cuando no hay admins activos.
- **Fix `IngestDocument`:** el batch de notificación por empleado usa `continue` ante un 404 de usuario soft-deleted, en vez de abortar todo el loop o loguear como error genérico.
- **Tests de regresión:** se cubre el contrato "excluir soft-deleted" en `Users` (GetEmailsByUsersId), `Permissions` (GetAdmins, nuevo), `Certificates`, `DailyReport`, `Disclaimer` y `EmployeeReminders`, validando que cada consumidor delega el filtro `paranoid` de Sequelize sin recalcularlo.
- **Artefactos Speckit:** spec, plan, tasks y contrato de la feature `007-exclude-deleted-users-emails`, más el cierre del pipeline de agentes en `memory/`.

## Notas adicionales

- El filtro real de soft-deleted ocurre en la capa de repositorio Sequelize (`paranoid: true` en `UserModel`); esta PR no toca esa capa, solo corrige la propagación de errores en los consumidores para no romper el envío de emails cuando el filtro ya excluyó al usuario en otro punto del flujo (ej. usuario borrado entre la creación del documento y el envío del email).
- El nuevo test de `GetAdmins` documenta un import circular preexistente (`Users` ↔ `Permissions`) no relacionado con esta feature, que impide testear el repositorio Sequelize real; se cubre el contrato un nivel más arriba, en el use case.
