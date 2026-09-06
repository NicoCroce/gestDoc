# Implementation Plan: Excluir usuarios eliminados de todos los envíos de email

**Branch**: `007-exclude-deleted-users-emails` | **Date**: 2026-09-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/007-exclude-deleted-users-emails/spec.md`

**Alcance**: Back-only (sin cambios de UI/frontend). No aplica brief de `frontend-design`.

## Summary

Garantizar que ningún flujo de envío de email del backend contacte a un usuario
soft-deleted (`Users.deletedAt` no nulo). La auditoría de código (ver `research.md`) confirma
que `UserModel` ya usa `paranoid: true`, por lo que la gran mayoría de las queries que
resuelven destinatarios (`getEmailsByUsersId`, `getPendingEmployeeIds`,
`getEmployeesByCompany`, `getAdmins`) **ya excluyen soft-deleted automáticamente** — no
requieren cambio de query, solo tests de regresión (SC-001/SC-002).

Se identificaron 2 gaps reales de comportamiento **implícito** que deben hacerse
**explícitos** para cumplir FR-004/FR-006/SC-004:

1. **Gap 1**: `SendEmailService.sendDocumentToEmail`, `signDocument`,
   `notifyLicenseStatusChange` y `Documents/IngestDocument.usecase.ts` dependen de que
   `GetUser` lance `AppError 404` (indistinguible de "usuario no encontrado" real) cuando el
   destinatario está soft-deleted, absorbido por un `try/catch` genérico. Se debe manejar el
   caso de forma explícita con logging distinguible.
2. **Gap 2**: `SendEmailService.sendEmailToAdmins` y el bloque de admins de `signDocument`
   usan `if (admins)` sobre un array que **siempre** existe (nunca `null`/`undefined`),
   dejando pasar el caso "0 admins válidos" hacia `mailNotificationService.sendOne({to: []})`.
   Debe cambiarse a `admins.length > 0`.

No se modifica el modelo de datos, no se agregan integraciones externas, no se cambian
contratos tRPC. El enfoque técnico es: (a) confirmar con tests los flujos ya correctos, (b)
hacer explícitos los dos gaps, (c) test por flujo (6 dominios).

## Technical Context

**Language/Version**: TypeScript 6.x estricto (Node.js), monorepo pnpm workspaces

**Primary Dependencies**: Express 5, tRPC v11, Sequelize v6 (MySQL, `paranoid: true` en
`UserModel`), Awilix 13 (DI), Zod 4, Pino 10 (logging)

**Storage**: MySQL vía Sequelize — sin cambios de schema (`Users.deletedAt` ya existe)

**Testing**: Vitest 2 — tests de Use Case/Service por regla de negocio (Principio V), con
soft-delete real de Sequelize (no solo mocks) donde el repositorio es el objeto bajo prueba

**Target Platform**: Node.js backend (`packages/server`), sin cambios en `packages/app`

**Project Type**: Modular Monolith existente — corrección transversal en 6 dominios +
`Application/Services` global, sin dominios nuevos

**Performance Goals**: N/A — no hay requisito de performance nuevo; el batch de 50 IDs
(Disclaimer) y las queries auditadas no cambian su forma ni su costo (mismo `paranoid`
scope ya aplicado por Sequelize)

**Constraints**: No modificar `Users.model.ts` ni `paranoid: true`; no agregar proveedores de
email nuevos; cero regresión para usuarios activos (SC-002); el fix debe ser auditable (log
distinguible para "destinatario omitido por soft-delete")

**Scale/Scope**: 6 dominios de negocio (`Disclaimer`, `EmployeeReminders`, `DailyReport`,
`Documents`, `Certificates`, `Permissions`) + 1 dominio fuente de verdad (`Users`, solo
lectura, sin cambios) + 1 servicio transversal (`Application/Services/SendEmail.service.ts`)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principio                       | Verificación requerida                                                                    | Resultado                                                                                                                                                                                                                                                                 |
| ------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I. Arquitectura Hexagonal / DDD | ¿La feature crea o modifica dominios? ¿Sigue la estructura de 5 capas?                    | No crea dominios. Los cambios (Gap 1/2) viven en `Application/` (use cases y `SendEmailService`, que ya es la capa Application del servicio transversal) y respetan la estructura existente. Ningún cambio toca `Domain/` ni el modelo de datos. **PASS**.                |
| II. Multi-Tenant Obligatorio    | ¿Toda query al repositorio filtra por `ownerId`?                                          | Sin cambios en el filtrado por `ownerId` existente; los métodos auditados ya lo respetan. La corrección no introduce queries nuevas. **PASS**.                                                                                                                            |
| III. TypeScript Estricto + Zod  | ¿Tipos derivados con `z.infer`? ¿Sin `any`?                                               | No se agregan tipos de entrada/salida nuevos (no hay endpoint nuevo). Los cambios son lógica interna sobre tipos ya existentes. **PASS**.                                                                                                                                 |
| IV. Flujo de Agentes Orquestado | ¿La tarea pasa por analyst (o Speckit) → implement → back/front → tester → qa → reviewer? | Origen Speckit (spec.md/plan.md/tasks.md); scope detectado como **back-only**. `@blendverse-implement` invoca solo `@blendverse-back` → `@blendverse-tester` → `@blendverse-qa` → `@blendverse-reviewer`. **PASS**.                                                       |
| V. Tests por Regla de Negocio   | ¿`@blendverse-tester` analizará el dominio y generará tests concretos por capa?           | Sí — un test por flujo/dominio (6 flujos, ver `contracts/`), con soft-delete real de Sequelize donde el repositorio es la unidad bajo test. **PASS**.                                                                                                                     |
| VI. Conventional Commits        | ¿El `<scope>` del commit coincide con el nombre del dominio afectado?                     | Commits separados por dominio afectado (`fix(disclaimer)`, `fix(documents)`, `fix(certificates)`, etc.) o un `fix(email)` transversal para `SendEmailService` — a decidir en `tasks.md`/implementación siguiendo `work-unit-commits`. **PASS** (sin violación de diseño). |
| VII. Aislamiento de Dominios    | ¿La feature importa repos de otros dominios? Si sí, ¿usa `cross-domain-relations`?        | `SendEmailService` (Application global) ya inyecta `GetAdmins` (Permissions) y `GetUser` (Users) como **use cases**, no como repositorios — patrón `cross-domain-relations` ya vigente. No se agregan imports de repositorios cross-domain. **PASS**.                     |

No hay violaciones — no se requiere `Complexity Tracking`.

## Project Structure

### Documentation (this feature)

```text
specs/007-exclude-deleted-users-emails/
├── plan.md              # Este archivo
├── research.md          # Fase 0 — auditoría completa por dominio, gaps 1 y 2
├── data-model.md         # Fase 1 — Users.deletedAt (sin cambios) + contrato de resolución
├── contracts/
│   └── active-recipient-resolution.contract.md  # Contrato interno Given/When/Then por método
├── quickstart.md        # Fase 1 — guía de validación manual + criterio para tests
└── tasks.md             # Fase 2 (/speckit.tasks — no generado por este comando)
```

### Source Code (repository root)

Sin dominios nuevos. Archivos existentes a modificar (por `@blendverse-back`, ver
`research.md` §Gaps y `data-model.md` para el mapa completo):

```text
packages/server/src/
├── Application/Services/SendEmail.service.ts
│   # Gap 1 (sendDocumentToEmail, signDocument, notifyLicenseStatusChange)
│   # Gap 2 (sendEmailToAdmins, bloque admins de signDocument)
└── domains/
    ├── Documents/Application/UseCases/IngestDocument.usecase.ts   # Gap 1 (log explícito)
    ├── Disclaimer/                                                 # solo tests (ya correcto)
    ├── EmployeeReminders/                                          # solo tests (ya correcto)
    ├── DailyReport/                                                # solo tests (ya correcto)
    ├── Permissions/                                                # solo tests (ya correcto)
    └── Users/                                                      # solo tests (ya correcto,
                                                                      #  sin tocar Users.model.ts)
```

Specs de test a crear/ampliar (estructura `specs/` por capa, según
`server.instructions.md`):

```text
packages/server/src/Application/Services/specs/SendEmail.service.spec.ts        # nuevo o ampliado
packages/server/src/domains/Documents/Application/UseCases/specs/IngestDocument.usecase.spec.ts
packages/server/src/domains/Disclaimer/Infrastructure/Database/specs/DisclaimerRepository.implementation.spec.ts
packages/server/src/domains/Users/Infrastructure/Database/specs/UsersRepository.implementation.spec.ts
packages/server/src/domains/Permissions/Infrastructure/Database/specs/PermissionsRepository.implementation.spec.ts
packages/server/src/domains/DailyReport/Application/UseCases/specs/SendReportEmail.usecase.spec.ts
```

**Structure Decision**: sin nuevos dominios ni carpetas de capa. La feature es una corrección
quirúrgica dentro de `Application/Services/SendEmail.service.ts` (servicio transversal
existente) y `Documents/Application/UseCases/IngestDocument.usecase.ts`, más cobertura de
tests en los 4 dominios/repositorios que ya cumplen el contrato pero carecen de test
explícito. No aplica ninguna de las opciones de estructura del template (single/web/mobile) —
es un monorepo existente con dominios ya establecidos.

## Complexity Tracking

> Sin violaciones de Constitution Check — tabla no aplica.
