# Quickstart: Validar exclusión de usuarios eliminados en envíos de email

**Feature**: `007-exclude-deleted-users-emails`

Guía de validación end-to-end manual/local. Para el detalle de casos por método ver
`contracts/active-recipient-resolution.contract.md`; para el mapeo completo de archivos
afectados ver `data-model.md` y `research.md`.

## Prerrequisitos

- Backend corriendo en local: `pnpm server:dev`
- Acceso a MySQL local con datos de una empresa (`ownerId`) con al menos 2 empleados y 1 admin
- Cliente HTTP/tRPC para disparar las mutations relevantes (o Postman/tRPC panel si existe)

## Setup de datos

```sql
-- Verificar el estado paranoid actual de un usuario de prueba
SELECT id, email, id_propietario, deletedAt FROM Usuarios WHERE id = <employeeId>;
```

Soft-delete real (no solo un UPDATE manual — usar el flujo del dominio si existe, o
equivalente a `UserModel.destroy()` de Sequelize, que setea `deletedAt = NOW()`):

```sql
UPDATE Usuarios SET deletedAt = NOW() WHERE id = <employeeId>;
```

## Escenario 1 — Disclaimer reminders (US1)

1. Crear/identificar un empleado con disclaimer pendiente (`DisclaimerAcceptance` sin registro
   o con hash inválido) y soft-deletearlo.
2. Ejecutar `disclaimer.sendReminders` (controller `DisclaimerController.sendReminders`) para
   la empresa.
3. **Esperado**: el batch de envío no incluye el email del empleado eliminado; el conteo
   `sent`/`total` de la respuesta no lo contempla.

## Escenario 2 — Daily report a admins (US2)

1. Identificar una empresa con 2 admins (rol id 1); soft-deletear uno.
2. Disparar la generación + envío del reporte diario (`DailyReport.scheduler` o el endpoint
   equivalente si existe para trigger manual).
3. **Esperado**: el email llega solo al admin activo. Si se soft-deletean TODOS los admins,
   el sistema no envía el email y el log muestra `'No admins found for owner, skipping daily
report email'` (o el mensaje equivalente post-fix para el caso "todos eliminados").

## Escenario 3 — Documentos (firma, nuevo documento, reenvío manual)

1. Soft-deletear un admin de la empresa.
2. Como empleado activo, firmar un documento (`documents.signDocument`).
   **Esperado**: el empleado recibe su email de confirmación; el admin eliminado NO recibe
   el aviso de firma.
3. Ingestar un documento nuevo asignado a un empleado soft-deleted
   (`documents.ingestDocument` o el flujo de carga correspondiente).
   **Esperado**: no se envía ningún email para ese empleado; el log indica que el destinatario
   fue omitido (no un error genérico); el documento queda creado igual.
4. Como usuario soft-deleted con sesión aún válida, intentar `documents.sendDocumentToEmail`.
   **Esperado**: no se envía el email; se registra la omisión; el endpoint no revienta con
   una excepción no controlada hacia el cliente.

## Escenario 4 — Cambio de estado de licencia (US4)

1. Soft-deletear al empleado dueño de una licencia pendiente.
2. Como admin, aprobar o rechazar esa licencia (`certificates.updateStatus` o equivalente).
3. **Esperado**: el cambio de estado se persiste (verificar en `GetCertificates`/DB) pero no
   se envía ningún email; el log distingue "destinatario omitido por soft-delete" de un error
   real.
4. Repetir con un empleado activo — **Esperado**: comportamiento sin cambios (regresión,
   SC-002).

## Verificación automatizada (referencia para `@blendverse-tester`)

Cada escenario anterior debe tener al menos un test en el dominio correspondiente que:

1. Cree (o mockee, según el contrato del método — ver `contracts/`) un usuario soft-deleted
   real (`deletedAt` no nulo) mezclado con usuarios activos.
2. Ejecute el use case/servicio bajo test.
3. Aserte que el array/llamada de envío resultante excluye exactamente al usuario eliminado.
4. Incluya el caso "todos eliminados" donde aplique (admins, batch de reminders) verificando
   que no se lanza excepción y se completa la operación de negocio.

## Rollback / limpieza

```sql
UPDATE Usuarios SET deletedAt = NULL WHERE id IN (<ids usados en las pruebas>);
```
