# Data Model: Excluir usuarios eliminados de todos los envíos de email

**Feature**: `007-exclude-deleted-users-emails`

> No se modifica el modelo de datos. Este documento describe el estado existente relevante
> para la feature (sin cambios de schema) y el modelo conceptual de "resolución de
> destinatario", que es el verdadero objeto de esta corrección.

## Entidad existente: `Users` (`UserModel`)

`packages/server/src/domains/Users/Infrastructure/Database/Users.model.ts` — **sin cambios**.

| Campo            | Tipo           | Relevancia para esta feature                                                    |
| ---------------- | -------------- | ------------------------------------------------------------------------------- |
| `id`             | BIGINT PK      | Identifica al destinatario en batches (`getEmailsByUsersId`, `IngestDocument`). |
| `email`          | STRING         | Dirección de destino de todo email resuelto desde `Users`.                      |
| `id_propietario` | BIGINT         | Tenant (`ownerId`); todo query ya filtra por esta columna (Principio II).       |
| `deletedAt`      | DATE, nullable | **Campo clave**. No nulo = usuario soft-deleted = excluido de emails.           |

Configuración Sequelize relevante (ya existente): `paranoid: true` en `UserModel.init(...)`.
Esto hace que Sequelize agregue automáticamente `WHERE deletedAt IS NULL` a `findAll`,
`findOne`, `findByPk` y `count` sobre `UserModel`, incluso cuando es el modelo base de una
consulta con `include`. No requiere ningún cambio.

## Concepto transversal: Resolución de Destinatario de Email

No es una entidad de persistencia nueva — es el contrato de comportamiento que deben cumplir
los métodos de repositorio/servicio que arman una lista de emails a partir de `Users`.

### Invariante (aplica a todo método de esta lista)

> Dado un conjunto de `Users` candidatos a destinatario, el método MUST devolver únicamente
> las direcciones de los registros con `deletedAt IS NULL` en el momento de la consulta.

### Métodos que implementan el contrato (mapa completo, ver `research.md` para detalle)

| Método                                                                 | Dominio              | Mecanismo                                         | Cambio requerido                                                   |
| ---------------------------------------------------------------------- | -------------------- | ------------------------------------------------- | ------------------------------------------------------------------ |
| `UsersRepositoryImplementation.getEmailsByUsersId`                     | Users                | `UserModel.findAll` (paranoid)                    | Ninguno — solo test                                                |
| `DisclaimerRepositoryImplementation.getPendingEmployeeIds`             | Disclaimer           | `UserModel.findAll` (paranoid)                    | Ninguno — solo test                                                |
| `DisclaimerRepositoryImplementation.getEmployeesByCompany`             | Disclaimer           | `UserModel.findAll` (paranoid)                    | Ninguno — solo test                                                |
| `PermissionsRepositoryImplementation.getAdmins`                        | Permissions          | `UserModel.findAll` + `include` (paranoid)        | Ninguno — solo test                                                |
| `UsersRepositoryImplementation.getUser` (vía `GetUser` use case)       | Users                | `UserModel.findOne` (paranoid)                    | Consumidores deben tratar "no resuelto" de forma explícita (Gap 1) |
| `SendEmailService.sendEmailToAdmins` / bloque admins de `signDocument` | Application (global) | Consume `GetAdmins`                               | Cambiar `if (admins)` → `if (admins.length > 0)` (Gap 2)           |
| `SendEmailService.sendDocumentToEmail`                                 | Application (global) | Consume `GetUser` (self)                          | Tratar ausencia de usuario de forma explícita (Gap 1)              |
| `SendEmailService.signDocument`                                        | Application (global) | Consume `GetUser` (self) + `GetAdmins`            | Gap 1 + Gap 2                                                      |
| `SendEmailService.notifyLicenseStatusChange`                           | Application (global) | Consume `GetUser` (empleado dueño de la licencia) | Tratar ausencia de usuario de forma explícita (Gap 1)              |
| `Documents/IngestDocument.usecase.ts` (loop por empleado)              | Documents            | Consume `GetUser` por empleado                    | Tratar ausencia de usuario de forma explícita (Gap 1)              |

### Estados (no hay máquina de estados nueva)

`deletedAt` ya es binario desde la perspectiva de esta feature: `NULL` (activo, incluido) /
`no NULL` (eliminado, excluido). No se agregan estados intermedios ni transiciones nuevas.

### Reglas de validación

- Ningún método de la tabla anterior puede pasar `paranoid: false` en su `where`/opciones de
  Sequelize al resolver destinatarios de email.
- Todo punto donde se resuelve "cero destinatarios válidos" tras excluir soft-deleted debe:
  1. No lanzar una excepción no controlada.
  2. Registrar (log) la omisión de forma distinguible de un fallo de infraestructura.
  3. Permitir que la operación de negocio subyacente (cambio de estado de licencia, ingesta de
     documento, generación de reporte) se complete con normalidad.
