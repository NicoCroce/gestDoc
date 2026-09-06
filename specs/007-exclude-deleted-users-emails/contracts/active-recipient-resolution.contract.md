# Contract: Active-Recipient Resolution (interno)

**Feature**: `007-exclude-deleted-users-emails`

Esta feature no expone endpoints ni tipos nuevos — no hay contrato tRPC/HTTP que documentar.
Este archivo formaliza el **contrato interno de comportamiento** que deben cumplir los
métodos identificados en `data-model.md`, para que `@blendverse-tester` pueda derivar casos
de prueba concretos por método sin ambigüedad.

## Contrato 1 — Repositorios que listan destinatarios (batch)

Aplica a: `UsersRepositoryImplementation.getEmailsByUsersId`,
`DisclaimerRepositoryImplementation.getPendingEmployeeIds`,
`DisclaimerRepositoryImplementation.getEmployeesByCompany`,
`PermissionsRepositoryImplementation.getAdmins`.

```
Given: un conjunto de Users candidatos, algunos con deletedAt no nulo
When: se invoca el método con un ownerId válido
Then:
  - El array devuelto NO contiene ningún email/id de un usuario con deletedAt no nulo
  - El array devuelto SÍ contiene todos los emails/ids de usuarios con deletedAt nulo que
    cumplen el resto de los filtros (ownerId, rol, búsqueda, etc.)
  - Si el resultado queda vacío tras excluir soft-deleted, el método devuelve `[]`
    (no null, no excepción)
```

## Contrato 2 — Resolución de un único destinatario (self / by-id)

Aplica a: `GetUser` (use case) consumido por `SendEmailService.sendDocumentToEmail`,
`SendEmailService.signDocument` (empleado), `SendEmailService.notifyLicenseStatusChange`
(empleado dueño de la licencia), `Documents/IngestDocument.usecase.ts` (por empleado).

```
Given: un userId que corresponde a un usuario con deletedAt no nulo
When: el flujo consumidor intenta resolver ese usuario como destinatario
Then:
  - No se envía ningún email hacia la dirección de ese usuario
  - El flujo consumidor registra (log) que el destinatario fue omitido por estar eliminado,
    distinguible de un log de fallo de infraestructura/envío
  - La operación de negocio que originó el intento de envío (firma de documento, ingesta de
    documento, cambio de estado de licencia) se completa sin lanzar error hacia el caller
```

## Contrato 3 — Envío a lista de admins

Aplica a: `SendEmailService.sendEmailToAdmins`, bloque de admins en
`SendEmailService.signDocument`, `SendReportEmail.usecase.ts` (ya conforme, usar como
referencia).

```
Given: GetAdmins devuelve una lista de emails (posiblemente vacía tras excluir soft-deleted)
When: el flujo evalúa si debe enviar el email a admins
Then:
  - Si la lista tiene 0 elementos, el email NO se envía y se registra (log) la omisión
  - Si la lista tiene 1+ elementos, el email se envía a exactamente esos destinatarios
  - La condición de decisión es sobre la LONGITUD del array, nunca sobre su truthiness
    (`[]` es truthy en JS — prohibido usar `if (admins)` como único chequeo)
```

## Fuera de alcance de este contrato

- Contenido del reporte diario (`DailyReport` secciones: licencias, vacaciones, etc.) — esos
  datos NO son direcciones de email, son contenido del cuerpo del mensaje; no aplica el
  contrato de exclusión (fuera del alcance del spec, ver Edge Cases).
- Emails ingresados manualmente que no provienen de `Users` (no existen hoy en el código
  auditado, pero si existieran quedan fuera de alcance por definición del spec).
