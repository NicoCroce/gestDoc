---
description: 'Task list template for feature implementation'
---

# Tasks: Excluir usuarios eliminados de todos los envíos de email

**Input**: Design documents from `/specs/007-exclude-deleted-users-emails/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/active-recipient-resolution.contract.md, quickstart.md

**Naturaleza de la feature**: corrección quirúrgica + regresión, sin dominios nuevos ni cambios de schema. `research.md` confirmó que `UserModel` (`paranoid: true`) ya excluye soft-deleted en casi todas las queries; solo hay **2 gaps reales de código** (ambos en `SendEmailService.ts` + uno replicado en `IngestDocument.usecase.ts`). El resto del alcance es **cobertura de test de regresión** sobre flujos ya conformes (SC-001/SC-002).

**Tests**: Esta feature es, por diseño (`plan.md` + `quickstart.md` §"Verificación automatizada"), una corrección validada mediante tests concretos de regresión con soft-delete real de Sequelize (Constitution Pr. V). A diferencia del flujo genérico de otras features, aquí los tests SÍ se planifican explícitamente como tareas (grupo (b) pedido), porque son el entregable principal que prueba SC-001/SC-002/SC-004. `@blendverse-tester` las ejecuta/amplía en su paso del pipeline, pero deben quedar identificadas aquí para no perder ningún flujo.

**Organization**: Tareas agrupadas por user story (spec.md). Dentro de cada story, primero los fixes reales (si aplica), luego los tests de regresión.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (archivos distintos, sin dependencias)
- **[Story]**: US1 (Disclaimer), US2 (DailyReport), US3 (Documents), US4 (Certificates)
- Rutas de archivo exactas incluidas en cada descripción

---

## Phase 1: Setup

**Purpose**: Confirmar entorno de validación antes de tocar código

- [ ] T001 Confirmar entorno local operativo per `quickstart.md` §Prerrequisitos: `pnpm server:dev` levantado, acceso a MySQL con una empresa (`ownerId`) que tenga ≥2 empleados y ≥1 admin para los escenarios de soft-delete manual

---

## Phase 2: Foundational

**N/A para esta feature.** `research.md` (§"Confirmación de no bypass") ya auditó todo `packages/server/src` y no encontró `paranoid: false` sobre `UserModel`, SQL crudo, ni cachés de listas de usuarios en los flujos de email. No hay infraestructura compartida nueva que bloquee las user stories: se avanza directo a los fixes/tests por story.

---

## Phase 3: User Story 1 - Disclaimer reminders no llegan a usuarios eliminados (Priority: P1) 🎯 MVP

**Goal**: Confirmar (sin cambios de código) que el batch de recordatorios de disclaimer excluye siempre a empleados soft-deleted.

**Independent Test**: Crear un empleado con disclaimer pendiente, soft-deletearlo (`UserModel.destroy()`), ejecutar `disclaimer.sendReminders` para la empresa y verificar que su email no aparece en el batch ni en el conteo de enviados.

**Estado**: ✅ Ya conforme (`research.md` fila 1-2). Ningún fix de código — solo tests de regresión (grupo b).

### Tests de regresión para User Story 1

- [ ] T002 [P] [US1] Test de regresión en `packages/server/src/domains/Disclaimer/Infrastructure/Database/specs/DisclaimerRepository.implementation.spec.ts` (crear el archivo — no existe hoy): `getPendingEmployeeIds` y `getEmployeesByCompany` con soft-delete real de Sequelize deben excluir al empleado eliminado y devolver `[]` cuando todos los candidatos están eliminados
- [ ] T003 [P] [US1] Ampliar `packages/server/src/domains/Disclaimer/Application/UseCases/specs/SendReminders.usecase.spec.ts` con caso: lote mixto de IDs (activos + soft-deleted) → el batch de envío resultante solo contiene los emails de empleados activos y el conteo `sent`/`total` no contempla al eliminado
- [ ] T004 [P] [US1] Ampliar `packages/server/src/domains/Users/Application/UseCases/specs/GetEmailsByUsersId.usecase.spec.ts` con soft-delete real: dado un array de IDs que incluye un usuario eliminado, el array de emails devuelto lo excluye (Contrato 1 de `contracts/active-recipient-resolution.contract.md`)

**Checkpoint**: US1 validado independientemente — el batch de disclaimer reminders queda cubierto por test de regresión, sin tocar código de producción.

---

## Phase 4: User Story 2 - Reporte diario solo a admins activos (Priority: P1)

**Goal**: Confirmar (sin cambios de código) que `SendReportEmail` y `GetAdmins` excluyen admins soft-deleted, incluyendo el caso "todos eliminados".

**Independent Test**: Dar de baja a un admin, generar el reporte diario, verificar que solo el admin activo lo recibe; si se dan de baja todos los admins, verificar que no se envía nada y se loguea `'No admins found for owner, skipping daily report email'`.

**Estado**: ✅ Ya conforme (`research.md` fila 3; `SendReportEmail.usecase.ts` ya maneja `admins.length === 0` correctamente — es la referencia usada por el Contrato 3). Ningún fix de código — solo tests de regresión.

### Tests de regresión para User Story 2

- [ ] T005 [P] [US2] Test de regresión en `packages/server/src/domains/Permissions/Infrastructure/Database/specs/PermissionsRepository.implementation.spec.ts` (crear el archivo y la carpeta `specs/` — no existen hoy): `getAdmins` con soft-delete real sobre `Users_RolesModel`/`UserModel` — excluye admins eliminados, incluye admins activos, devuelve `[]` si todos están eliminados
- [ ] T006 [P] [US2] Ampliar `packages/server/src/domains/DailyReport/Application/UseCases/specs/SendReportEmail.usecase.spec.ts` con: (a) empresa con 1 admin activo + 1 soft-deleted → email solo al activo; (b) todos los admins soft-deleted → `success: false`, no se llama a `dailyReportEmailSender.send`, se loguea la omisión (mismo criterio que "sin admins" hoy, SC-001/SC-003)

**Checkpoint**: US1 + US2 validados de forma independiente — ambos flujos P1 cubiertos sin cambios de producción.

---

## Phase 5: User Story 3 - Notificaciones de documentos respetan usuarios eliminados (Priority: P2)

**Goal**: Corregir los 2 gaps reales que afectan este flujo (Gap 2 en el bloque de admins de `signDocument`, Gap 1 en `sendDocumentToEmail`/`signDocument`/`IngestDocument`) y cubrir con tests de regresión el resto (EmployeeReminders, que ya es conforme).

**Independent Test**: Firmar un documento como empleado activo con un admin soft-deleted en la empresa → el empleado recibe su email, el admin eliminado no. Ingestar un documento para un empleado soft-deleted → no se envía email y el log distingue "destinatario omitido por soft-delete" de un error real.

### Fixes reales para User Story 3 (secuenciales — mismo archivo `SendEmail.service.ts`)

> ⚠️ T007–T009 tocan el mismo archivo (`SendEmail.service.ts`): ejecutar en orden, sin paralelismo entre ellas.

- [ ] T007 [US3] **Fix Gap 2** (`if (admins)` truthy bug) en `packages/server/src/Application/Services/SendEmail.service.ts` línea 160, bloque de admins dentro de `signDocument()`: cambiar `if (admins)` por `if (admins.length > 0)` y loguear (`loggerContext(...).warn(...)`) la omisión "sin admins válidos tras excluir soft-deleted" cuando la lista quede vacía, en vez de intentar `sendOne({ to: [] })`
- [ ] T008 [US3] **Fix Gap 1** en `packages/server/src/Application/Services/SendEmail.service.ts` método `sendDocumentToEmail()` (líneas 103-130): antes de armar el email, verificar explícitamente que `getCurrentUser` resolvió un usuario válido (no depender del `try/catch` genérico que absorbe el `AppError 404` de `GetUser`); si el usuario está soft-deleted/no resuelto, loguear un mensaje distinguible (ej. `'Document email skipped: recipient not active'`) separado del catch de error de infraestructura, y no lanzar excepción hacia el caller
- [ ] T009 [US3] **Fix Gap 1** en `packages/server/src/Application/Services/SendEmail.service.ts` método `signDocument()` (líneas 132-180), resolución del empleado vía `getCurrentUser`: mismo tratamiento explícito que T008 para el envío al empleado que firmó (el bloque de admins ya quedó cubierto por T007)
- [ ] T010 [US3] **Fix Gap 1** en `packages/server/src/domains/Documents/Application/UseCases/IngestDocument.usecase.ts` (líneas 62-93), loop por `employeeId`: distinguir en el `catch` si el error proviene de `GetUser` por usuario no resuelto/soft-deleted (`AppError` 404) del resto de errores inesperados, y loguear un mensaje distinguible (ej. `'Document notification skipped: employee not active'`) en vez del genérico `'New document notification skipped (ingest continues)'` para ese caso puntual — sin alterar que el ingreso del documento (`created`) nunca se bloquea (FR-015 de `specs/004-employee-daily-reminders/spec.md`, ya vigente)

### Tests de regresión para User Story 3

- [ ] T011 [P] [US3] Crear `packages/server/src/Application/Services/specs/SendEmail.service.spec.ts` (no existe hoy) cubriendo, con soft-delete real: `signDocument` (empleado activo + admin soft-deleted → email a empleado sí, a admin no; todos los admins soft-deleted → no se envía email de admins y se loguea la omisión de T007), `sendDocumentToEmail` (usuario actual soft-deleted → no se envía, log distinguible de T008)
- [ ] T012 [P] [US3] Ampliar `packages/server/src/domains/Documents/Application/UseCases/specs/IngestDocument.usecase.spec.ts` con: empleado destinatario soft-deleted antes de la ingesta → no se llama a `_notifyNewDocument` para ese empleado, el documento queda creado igual (`documentIds` lo incluye), y el log distingue el caso (T010)
- [ ] T013 [US3] **Eliminada** — el edge case "usuario soft-deleted como remitente/destinatario de sí mismo" (spec.md línea 79) ya queda cubierto por T011 en `SendEmail.service.spec.ts`, único lugar donde se resuelve el destinatario vía `GetUser`. `SendDocumentToEmail.usecase.ts` solo valida existencia/descargabilidad del `Document` y no resuelve destinatarios ni toca soft-delete, por lo que un test ahí sería irrelevante (hallazgo F1 de `/speckit.analyze`)
- [ ] T014 [P] [US3] Test de regresión (ya conforme, sin fix) en `packages/server/src/domains/EmployeeReminders/Application/UseCases/specs/GenerateDailyReminder.usecase.spec.ts` y `SendEmployeeReminderEmail.usecase.spec.ts`: dado que el email viene de `GetEmployeesByCompany` (Disclaimer, cubierto por T002), agregar caso explícito de empleado soft-deleted excluido del recordatorio para satisfacer SC-001 ("al menos un caso por flujo existente", incluyendo employee reminders como flujo propio)

**Checkpoint**: US3 completo — 2 gaps corregidos y testeados, EmployeeReminders con regresión propia.

---

## Phase 6: User Story 4 - Cambio de estado de licencia solo notifica a empleados activos (Priority: P2)

**Goal**: Corregir el Gap 1 restante (`notifyLicenseStatusChange`) y el Gap 2 remanente en `sendEmailToAdmins` (usado por `addLincence`, flujo de alta de licencia — mismo bug de T007 pero en el otro call site del archivo), y cubrir con test de regresión.

**Independent Test**: Aprobar/rechazar la licencia de un empleado soft-deleted → el cambio de estado se persiste, no se envía email, el log distingue "destinatario omitido por soft-delete" de un error real.

### Fixes reales para User Story 4 (secuenciales — mismo archivo `SendEmail.service.ts`, después de T007-T009)

- [ ] T015 [US4] **Fix Gap 2** en `packages/server/src/Application/Services/SendEmail.service.ts` línea 72, método privado `sendEmailToAdmins()` (usado por `addLincence`, alta de licencia → admins): cambiar `if (admins)` por `if (admins.length > 0)` y loguear la omisión, mismo criterio que T007
- [ ] T016 [US4] **Fix Gap 1** en `packages/server/src/Application/Services/SendEmail.service.ts` método `notifyLicenseStatusChange()` (líneas 182-228): tratar de forma explícita el caso "empleado dueño de la licencia soft-deleted" al resolver `employee` vía `GetUser` (`certificate.userId`), loguear distinguible (ej. `'License status email skipped: employee not active'`), y garantizar que el cambio de estado de la licencia (ya persistido antes de esta llamada en `Certificates.service.ts`) no se ve afectado

### Tests de regresión para User Story 4

- [ ] T017 [P] [US4] Ampliar `packages/server/src/Application/Services/specs/SendEmail.service.spec.ts` (creado en T011) con: `notifyLicenseStatusChange` — empleado dueño soft-deleted → no se envía email, log distinguible (T016); `addLincence`/`sendEmailToAdmins` — todos los admins soft-deleted → no se envía, log distinguible (T015)
- [ ] T018 [P] [US4] Ampliar `packages/server/src/domains/Certificates/Application/specs/Certificates.service.spec.ts` con: `updateStatus`/cambio de estado sobre una licencia de empleado soft-deleted → la operación de negocio se completa (estado persistido) y `sendEmailService.notifyLicenseStatusChange` no interrumpe el flujo aunque el destinatario esté ausente (verificar con mock del servicio de email, ya que el detalle de exclusión se prueba a nivel de T017)

**Checkpoint**: Las 4 user stories quedan validadas de forma independiente — feature completa.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [ ] T019 Ejecutar `pnpm tsc` y `pnpm lint` sobre `packages/server` tras T007-T010 y T015-T016 (los 5 fixes reales) para confirmar que no se introdujeron errores de tipos ni de lint
- [ ] T020 Ejecutar `pnpm test` completo en `packages/server` y confirmar que los 6 flujos (Disclaimer, DailyReport, Permissions, Documents, EmployeeReminders, Certificates) pasan en verde, sin regresión en los tests ya existentes de usuarios activos (SC-002)
- [ ] T021 Recorrer manualmente los 4 escenarios de `quickstart.md` (Disclaimer, Daily report, Documentos, Licencias) contra un entorno local para validación end-to-end antes de cerrar la feature

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias — un solo task de verificación de entorno
- **Foundational (Phase 2)**: N/A — no bloquea nada
- **User Stories (Phase 3-6)**: todas pueden iniciar tras Phase 1; no dependen entre sí para ejecutarse, pero **comparten un archivo** (`SendEmail.service.ts`) entre US3 (Phase 5) y US4 (Phase 6)
- **Polish (Phase 7)**: depende de que TODOS los fixes reales (T007-T010, T015-T016) estén aplicados

### Dependencia crítica entre stories (mismo archivo)

`SendEmail.service.ts` es tocado por T007, T008, T009 (US3) y T015, T016 (US4). Si se trabaja en paralelo por distintas personas, **US3 debe completar sus 3 ediciones sobre ese archivo antes de que US4 empiece las suyas** (o viceversa) para evitar conflictos de merge — no ejecutar T007-T009 y T015-T016 en simultáneo. El resto de cada story (tests, y los archivos de otros dominios) sí es independiente.

### Dentro de cada story

- Fixes (si aplica) antes que los tests que los verifican (T007→T011, T008→T011, T009→T011, T010→T012, T015→T017, T016→T017)
- Tests de repositorio/use case que no dependen de un fix (US1, US2) pueden empezar en cualquier momento tras Phase 1

### Parallel Opportunities

- Phase 3 (US1): T002, T003, T004 en paralelo (archivos distintos)
- Phase 4 (US2): T005, T006 en paralelo (archivos distintos)
- Phase 5 (US3): T007→T008→T009→T010 secuenciales (mismo archivo, excepto T010 que es otro archivo y puede ir en paralelo con T007-T009); T011, T012, T014 en paralelo entre sí una vez cerrados sus fixes correspondientes (T013 eliminada, ver F1)
- Phase 6 (US4): T015→T016 secuenciales (mismo archivo, y después de T007-T009 de US3); T017, T018 en paralelo entre sí

---

## Parallel Example: User Story 1

```bash
# Los 3 tests de regresión de US1 no comparten archivo — se lanzan juntos:
Task: "Test de regresión DisclaimerRepository.implementation.spec.ts"
Task: "Ampliar SendReminders.usecase.spec.ts"
Task: "Ampliar GetEmailsByUsersId.usecase.spec.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 (Setup)
2. Phase 2 (Foundational) — N/A, sin bloqueo
3. Phase 3 (US1) — Disclaimer, sin fixes de código, solo tests de regresión
4. **STOP y VALIDAR**: correr `pnpm test` en `Disclaimer` y `Users` antes de seguir

### Incremental Delivery

1. Setup + Foundational → listo
2. US1 (Disclaimer) → test → validar → sin riesgo de romper nada (solo tests nuevos)
3. US2 (DailyReport) → test → validar → ídem
4. US3 (Documents) → **2 fixes reales** (Gap 1 + Gap 2, 4 ediciones en `SendEmail.service.ts` + 1 en `IngestDocument.usecase.ts`) → test → validar
5. US4 (Certificates) → **fixes restantes** (Gap 1 + Gap 2 en los otros 2 call sites de `SendEmail.service.ts`) → test → validar
6. Polish (tsc + lint + suite completa + quickstart manual)

### Resumen de fixes reales (grupo a — 2 gaps, 5 ediciones de código)

| Gap | Descripción                                | Archivo                     | Método                                        | Task | Story |
| --- | ------------------------------------------ | --------------------------- | --------------------------------------------- | ---- | ----- |
| 2   | `if (admins)` truthy bug                   | `SendEmail.service.ts`      | `signDocument` (bloque admins)                | T007 | US3   |
| 1   | Manejo explícito soft-deleted vs no-existe | `SendEmail.service.ts`      | `sendDocumentToEmail`                         | T008 | US3   |
| 1   | Manejo explícito soft-deleted vs no-existe | `SendEmail.service.ts`      | `signDocument` (empleado)                     | T009 | US3   |
| 1   | Manejo explícito soft-deleted vs no-existe | `IngestDocument.usecase.ts` | loop por empleado                             | T010 | US3   |
| 2   | `if (admins)` truthy bug                   | `SendEmail.service.ts`      | `sendEmailToAdmins` (usado por `addLincence`) | T015 | US4   |
| 1   | Manejo explícito soft-deleted vs no-existe | `SendEmail.service.ts`      | `notifyLicenseStatusChange`                   | T016 | US4   |

### Resumen de tests de regresión (grupo b — 6 dominios ya conformes)

| Dominio           | Flujo                                                                                             | Tasks      |
| ----------------- | ------------------------------------------------------------------------------------------------- | ---------- |
| Disclaimer        | `getPendingEmployeeIds`, `getEmployeesByCompany`, `SendReminders`                                 | T002, T003 |
| Users             | `GetEmailsByUsersId` (batch)                                                                      | T004       |
| Permissions       | `getAdmins`                                                                                       | T005       |
| DailyReport       | `SendReportEmail`                                                                                 | T006       |
| Documents         | `IngestDocument`, `SendEmailService` (signDocument/sendDocumentToEmail)                           | T011, T012 |
| EmployeeReminders | `GenerateDailyReminder`, `SendEmployeeReminderEmail`                                              | T014       |
| Certificates      | `Certificates.service` (updateStatus), `SendEmailService.notifyLicenseStatusChange`/`addLincence` | T017, T018 |

---

## Notes

- [P] = archivos distintos, sin dependencia
- [Story] mapea la tarea a la user story de `spec.md` para trazabilidad
- T007-T009 y T015-T016 son el único punto de conflicto potencial de merge (mismo archivo) — respetar el orden indicado en Dependencies
- Evitar: tests que mockeen el repositorio para "simular" la exclusión — `research.md` exige soft-delete real (`UserModel.destroy()`) donde el repositorio es la unidad bajo test
