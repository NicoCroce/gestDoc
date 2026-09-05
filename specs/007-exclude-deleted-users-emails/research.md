# Research: Excluir usuarios eliminados de todos los envíos de email

**Feature**: `007-exclude-deleted-users-emails` | **Fecha**: 2026-09-05

## Método

Auditoría de código (no hay NEEDS CLARIFICATION pendiente: el spec y sus Assumptions ya
resuelven el enfoque). Se recorrió cada flujo de envío listado en el spec desde el
controller/scheduler hasta la query Sequelize que resuelve el destinatario, usando el grafo
de conocimiento del proyecto (`codebase-memory-mcp`) y lectura directa de archivos.

## Hallazgo raíz: `paranoid: true` ya cubre casi todo

`Users.model.ts` (línea 73) define `paranoid: true` sobre `UserModel`. Sequelize v6 con
`paranoid: true` agrega automáticamente `deletedAt IS NULL` a **toda** query estándar sobre
ese modelo (`findAll`, `findOne`, `findByPk`, `count`), y ese scope se aplica igual cuando
`UserModel` es el modelo **base** de una consulta con `include` (los joins no lo desactivan).//
Esto confirma la Assumption del spec.

- **Decision**: no se requiere agregar `deletedAt: null` manualmente en ninguna query que use
  `UserModel.findAll/findOne/count` como modelo base, siempre que no se pase `paranoid: false`.
- **Rationale**: agregar el filtro explícito sería redundante y ruido en el código; el riesgo
  real está en los puntos donde el filtro se **bypasea** o donde el "no hay destinatario válido"
  se maneja de forma implícita/accidental en lugar de explícita.
- **Alternativas consideradas**: forzar `deletedAt: null` explícito en cada `where` como
  medida defensiva. Rechazada — contradice la convención Sequelize del proyecto y agrega
  mantenimiento sin beneficio real (no hay ningún `paranoid: false` activo sobre `UserModel`
  en las rutas de email auditadas).

## Auditoría por dominio/flujo

| #   | Flujo (User Story)                            | Archivo(s) clave                                                                                                           | Resolución de destinatario                                      | Estado                                                                                                                                                               |
| --- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Disclaimer reminders (US1)                    | `Disclaimer/Application/UseCases/SendReminders.usecase.ts` → `UsersRepositoryImplementation.getEmailsByUsersId`            | `UserModel.findAll({ where: { id: userIds, id_propietario } })` | ✅ Ya excluye soft-deleted (paranoid). Falta test de regresión explícito.                                                                                            |
| 1   | Pending IDs previos al batch                  | `DisclaimerRepositoryImplementation.getPendingEmployeeIds`                                                                 | `UserModel.findAll({ where: { id_propietario } })`              | ✅ Ya excluye. Falta test.                                                                                                                                           |
| 2   | Daily report → admins (US2)                   | `DailyReport/.../SendReportEmail.usecase.ts` → `GetAdmins` (Permissions) → `PermissionsRepositoryImplementation.getAdmins` | `UserModel.findAll({ include: [Users_RolesModel] })`            | ✅ Ya excluye (paranoid aplica al modelo base del include). Caso "todos eliminados" ya cubierto por el check `admins.length === 0` en `SendReportEmail`. Falta test. |
| 3   | Firma de documento → empleado + admins (US3)  | `SendEmailService.signDocument` → `getCurrentUser` (`GetUser`) + `getAdmins` (`GetAdmins`)                                 | `UserModel.findOne`/`findAll`                                   | ⚠️ Ver "Gaps" #1 y #2 abajo.                                                                                                                                         |
| 3   | Nuevo documento → empleado (US3)              | `Documents/.../IngestDocument.usecase.ts` → `GetUser` → `NotifyNewDocument`                                                | `UserModel.findOne` vía `GetUser`                               | ⚠️ Ver "Gap" #1 abajo (comportamiento correcto mas implícito).                                                                                                       |
| 3   | Reenvío manual / notificación a admins (US3)  | `SendEmailService.sendDocumentToEmail` (self) y `sendEmailToAdmins` (admins)                                               | `getCurrentUser` / `getAdmins`                                  | ⚠️ Ver "Gaps" #1 y #2.                                                                                                                                               |
| 4   | Cambio de estado de licencia → empleado (US4) | `SendEmailService.notifyLicenseStatusChange` → `GetUser` con `certificate.userId`                                          | `UserModel.findOne` vía `GetUser`                               | ⚠️ Ver "Gap" #1.                                                                                                                                                     |

## Gaps identificados (requieren corrección explícita)

### Gap 1 — "no encontrado" implícito en vez de exclusión explícita

`GetUser.execute()` (`Users/Application/UseCases/GetUser.usecase.ts`) lanza
`AppError('User not found', 404)` cuando `usersRepository.getUser()` devuelve `null` — lo
cual ocurre tanto si el ID no existe como si el usuario está soft-deleted (mismo código,
paranoid excluye el registro). Los tres consumidores de `SendEmailService` que usan
`GetUser` para resolver el destinatario (`sendDocumentToEmail`, `signDocument`,
`notifyLicenseStatusChange`) envuelven la llamada en un `try/catch` genérico que loguea
`"Failed to send ... email"` y no reenvía el error — por lo que **hoy no se envía el email**,
pero:

- El comportamiento correcto es un efecto secundario de un error no relacionado (404 genérico),
  no una verificación intencional de "usuario eliminado".
- El log resultante (`Failed to send document to email`, etc.) es indistinguible de un fallo
  real de infraestructura (timeout SMTP, etc.), lo que dificulta auditar específicamente
  "se omitió un envío por usuario eliminado" (SC-004 pide poder verificar esto).
- Un test automatizado de "no se envía a usuario eliminado" hoy pasaría, pero sería frágil:
  depende de que `GetUser` siga lanzando exactamente en ese punto y de que nadie cambie el
  catch genérico a uno más específico que no cubra ese caso.

**Decision**: reemplazar la dependencia implícita por una verificación explícita antes de
armar el email — capturar el caso "recipiente no resuelto" (uso de `GetUser` sigue siendo
válido como fuente, pero el flujo debe checkear el resultado nulo/ausente de forma expresa,
o distinguir el log de "omitido por destinatario inválido" del de "fallo de envío").
Aplica a: `SendEmailService.sendDocumentToEmail`, `SendEmailService.signDocument`,
`SendEmailService.notifyLicenseStatusChange`, `Documents/IngestDocument.usecase.ts`.

**Rationale**: cumple FR-004 (auditar y corregir cualquier resolución que dependa de un
bypass implícito) y FR-006 (manejar explícitamente "sin destinatario válido" con log
distinguible). No cambia el comportamiento observable para el caso feliz (usuario activo).

**Alternativas consideradas**: dejar el comportamiento actual tal cual, ya que "funciona".
Rechazada — no es auditable ni testeable de forma robusta, y el spec pide explícitamente
"corregir" (FR-004), no solo "verificar que funcione por casualidad".

### Gap 2 — `if (admins)` no distingue "sin admins válidos" de "hay admins"

`SendEmailService.sendEmailToAdmins` (usado por `signDocument`) y el bloque de `signDocument`
que construye el email a admins usan `if (admins)` para decidir si envían. `GetAdmins` /
`PermissionsRepositoryImplementation.getAdmins` **siempre** devuelve un array (`[]` si no hay
admins o si todos están soft-deleted), y `if ([])` es **truthy** en JS. Esto significa que,
si todos los admins de la empresa están soft-deleted, el código intenta igual
`mailNotificationService.sendOne({ to: [], ... })`, delegando en que Nodemailer falle con
"No recipients defined" — de nuevo, un comportamiento correcto por accidente (el catch externo
lo absorbe), no por diseño.

**Decision**: cambiar la condición a `admins.length > 0` (o equivalente explícito) en los dos
puntos de `SendEmailService` que hoy usan `if (admins)`, y loguear la omisión ("sin admins
válidos tras excluir soft-deleted") en vez de dejar que dependa de que el proveedor SMTP
rechace un `to: []`.

**Rationale**: cumple FR-006 y el Edge Case "¿qué pasa si todos los destinatarios están
soft-deleted?" de forma explícita y desacoplada del comportamitno de Nodemailer.

**Alternativas consideradas**: ninguna — es un fix directo y de bajo riesgo, coherente con
el patrón ya usado en `SendReportEmail.usecase.ts` (`if (!admins || admins.length === 0)`).

## Confirmación de "no bypass" (FR-004 / SC-004)

Búsqueda exhaustiva en `packages/server/src` de:

- `paranoid: false` → 1 sola ocurrencia en todo el server, sobre `Theme.model.ts`
  (dominio `Themes`, no relacionado a `Users` ni a email). Ningún `paranoid: false` sobre
  `UserModel`.
- `sequelize.query(` / SQL crudo → ninguna ocurrencia relacionada a `UserModel` o resolución
  de destinatarios de email (los matches de `.query(` son todos `protectedProcedure.query(...)`
  de tRPC, sin relación).
- Mecanismos de cache de listas de usuarios (`cache`, resultados precalculados) en los
  dominios auditados (`Users`, `Disclaimer`, `EmployeeReminders`, `DailyReport`, `Documents`,
  `Certificates`, `Permissions`) → ninguno encontrado.

**Conclusión**: no existe ningún bypass explícito del scope `paranoid` en las rutas de
resolución de destinatarios de email. La única corrección de código real es la de los Gaps 1
y 2 (hacer explícito lo que hoy es implícito), más la cobertura de tests exigida por SC-001.

## Flujos ya seguros sin cambios de código (solo requieren test de regresión)

- `SendReminders.usecase.ts` (Disclaimer) — vía `getPendingEmployeeIds` + `getEmailsByUsersId`.
- `SendReportEmail.usecase.ts` (DailyReport) — vía `GetAdmins`, ya maneja `length === 0`.
- `GenerateDailyReminder.usecase.ts` / `SendEmployeeReminderEmail.usecase.ts`
  (EmployeeReminders) — el email viene de `GetEmployeesByCompany` (Disclaimer, paranoid-safe),
  no de una query propia.
- `NotifyNewDocument.usecase.ts` — recibe `employeeEmail` ya resuelto por el caller
  (`IngestDocument`), que a su vez depende del Gap 1 (`GetUser`).

## Decisiones de testing (Phase 1)

- **Decision**: los tests de regresión (SC-001) se agregan a nivel de Use Case / Service,
  con un usuario soft-deleted creado vía `UserModel.destroy()` (soft-delete real de Sequelize,
  no un mock de `deletedAt`) para validar el comportamiento real de `paranoid`.
- **Rationale**: mockear el repositorio para "simular" exclusión no probaría que Sequelize
  realmente excluye — el riesgo que motiva el spec es justamente el mecanismo de persistencia.
  Los tests de Use Case que dependen de repositorios ya mockeados (ej.
  `Certificates.service.spec.ts`) se complementan con tests de integración de repositorio
  donde aplique.
- **Alternativas consideradas**: solo mocks — rechazado, no cubre el riesgo real (SC-004).
