# Implementation Plan: License Rejection Reason

**Branch**: `006-license-rejection-reason` | **Date**: 2026-08-18 | **Spec**: [spec.md](./spec.md)

**Input**: Speckit — `specs/006-license-rejection-reason/spec.md`

---

## Summary

Cuando un admin cambia el estado de una licencia a "rechazado", el sistema debe interceptar la acción con un modal para capturar el motivo de rechazo. El motivo se persiste en la tabla `certificados` (nueva columna `motivo_rechazo`) y se incluye en el email de notificación al empleado. La feature afecta únicamente el dominio `Certificates` en el servidor y el componente `CertificateActions` en el frontend; no crea dominios nuevos.

---

## Technical Context

**Language/Version**: TypeScript 6.x estricto (monorepo pnpm workspaces)

**Primary Dependencies**:

- Backend: Express 5, tRPC v11, Sequelize v6 (MySQL), Awilix 13, Zod 4, Pino 10
- Frontend: React 19, Vite 8, TanStack Query v5, React Router v7, React Hook Form + Zod 4, Radix UI, Tailwind CSS v4

**Storage**: MySQL — tabla `certificados`, nueva columna `motivo_rechazo VARCHAR(500) NULL`

**Testing**: Vitest 2 (unit + integration por capa DDD)

**Target Platform**: Monorepo — `packages/server` + `packages/app`

**Project Type**: Web service (API tRPC) + SPA React

**Performance Goals**: Sin cambios de performance — la operación es idéntica a `updateCertificateStatus` existente + 1 campo en el UPDATE

**Constraints**: Sin cambios de esquema rompedores; `motivo_rechazo = NULL` para registros históricos es válido y no genera errores

**Scale/Scope**: Feature sobre dominio existente — ~15 archivos a modificar + 1 componente nuevo (`RejectionReasonModal.tsx`) + 1 migración SQL (~17 artefactos en total)

---

## Constitution Check

| Principio                       | Verificación                                                                                                                                                                        | Estado  |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| I. Arquitectura Hexagonal / DDD | Modificación en orden Domain → Application → Infrastructure → Presentation. Sin barrel expuesto. Registro Awilix sin cambios (no hay clases nuevas).                                | ✅ PASS |
| II. Multi-Tenant Obligatorio    | `updateCertificateStatus` en el repositorio ya filtra por `ownerId` mediante JOIN con `UserModel`. El campo `rejectionReason` se forwarded sin exponer `id_propietario` al cliente. | ✅ PASS |
| III. TypeScript Estricto + Zod  | `rejectionReason` en el schema Zod del controller; tipos derivados con `z.infer` en `certificates.types.ts`; frontend usa `inferRouterOutputs` — ningún tipo manual adicional.      | ✅ PASS |
| IV. Flujo de Agentes Orquestado | Input desde Speckit; `@blendverse-implement` como orquestador sin transcripción.                                                                                                    | ✅ PASS |
| V. Tests por Regla de Negocio   | `@blendverse-tester` genera tests para las 4 reglas de negocio del use case. Archivos sin lógica (modelo, rutas, DI) quedan sin test propio.                                        | ✅ PASS |
| VI. Conventional Commits        | Scope `certificates` para todos los commits de este dominio.                                                                                                                        | ✅ PASS |
| VII. Aislamiento de Dominios    | Sin imports de repositorios de otros dominios. El frontend importa tipos de `@server` (permitido, unidireccional).                                                                  | ✅ PASS |

**Veredicto**: Sin violaciones. Sin tabla de complejidad requerida.

---

## Project Structure

### Documentation (esta feature)

```text
specs/006-license-rejection-reason/
├── spec.md             # Especificación aprobada
├── frontend-design.md  # Dirección visual del modal
├── plan.md             # Este archivo
├── research.md         # Decisiones técnicas y patrones
├── data-model.md       # Cambios a entidad, modelo y repositorio
├── quickstart.md       # Guía de validación end-to-end
├── contracts/
│   └── update-certificate-status.md  # Input/Output del endpoint modificado
└── tasks.md            # Generado por /speckit.tasks (no por este comando)
```

### Source Code afectado

```text
packages/server/src/
├── migrations/
│   └── 002_rejection_reason.sql                        # ← NUEVO
├── Infrastructure/utils/Email/Templates/
│   ├── types.ts                                         # ← MODIFICAR
│   └── licenseStatusChange.template.ts                  # ← MODIFICAR
├── Application/Services/
│   └── SendEmail.service.ts                             # ← MODIFICAR
└── domains/Certificates/
    ├── Domain/
    │   ├── Certificate.types.ts                         # ← MODIFICAR
    │   ├── Certificate.entity.ts                        # ← MODIFICAR
    │   └── Certificate.respository.ts                   # ← MODIFICAR (IUpdateCertificateStatusRepository)
    ├── Application/
    │   ├── certificates.types.ts                        # ← MODIFICAR (IUpdateCertificateStatus)
    │   ├── digest.ts                                    # ← MODIFICAR (convertToDTO)
    │   ├── DTO/CertificateDTO.ts                        # ← MODIFICAR
    │   ├── UseCases/
    │   │   └── UpdateCertificateStatus.usecase.ts       # ← MODIFICAR
    │   └── Certificates.service.ts                      # ← MODIFICAR
    └── Infrastructure/
        ├── Controllers/
        │   └── Certificates.controller.ts               # ← MODIFICAR (Zod schema + superRefine)
        └── Databases/
            ├── Certificates.model.ts                    # ← MODIFICAR (declarar motivo_rechazo)
            └── CertificatesRepository.implementation.ts # ← MODIFICAR

packages/app/src/Domains/Certificates/
├── Hooks/
│   └── useUpdateCertificateStatus.ts                    # ← MODIFICAR (input extendido)
└── Components/
    ├── Certificate/
    │   └── CertificateActions.tsx                       # ← MODIFICAR (interceptar rechazado)
    └── RejectionReasonModal.tsx                         # ← NUEVO
```

**Structure Decision**: Feature aditiva sobre dominio existente. Patrón Monolith + Hexagonal. Sin nuevos dominios, sin nuevas rutas tRPC, sin nuevas páginas.

---

## Fases de Implementación

### Fase 1 — Backend: Domain + Application

**Archivos**:

1. `Domain/Certificate.types.ts` — agregar `rejectionReason?: string` a `ICertificate`
2. `Domain/Certificate.entity.ts` — campo `_rejectionReason` en constructor, `create()`, `values`, getter
3. `Domain/Certificate.respository.ts` — `rejectionReason?` en `IUpdateCertificateStatusRepository`
4. `Application/certificates.types.ts` — `rejectionReason?` en `IUpdateCertificateStatus`
5. `Application/DTO/CertificateDTO.ts` — `rejectionReason?: string`
6. `Application/digest.ts` — incluir `rejectionReason` en `convertToDTO`
7. `Application/UseCases/UpdateCertificateStatus.usecase.ts` — forward `rejectionReason` al repo
8. `Application/Certificates.service.ts` — pasar `rejectionReason` a `notifyLicenseStatusChange`
   > ⚠️ **Dependencia cruzada**: el paso 8 requiere que `INotifyLicenseStatusChange` en `SendEmail.service.ts` (Fase 3, T017) ya declare `rejectionReason?`. TypeScript strict no compila hasta que esa interfaz exista. Implementar Fase 3 Email layer (T016–T017) **antes** del paso 8.

### Fase 2 — Backend: Infrastructure

**Archivos**:

1. `Infrastructure/Databases/Certificates.model.ts` — declarar `motivo_rechazo: CreationOptional<string | null>` + init
2. `Infrastructure/Databases/CertificatesRepository.implementation.ts`:
   - `updateCertificateStatus`: `certificate.update({ estado, motivo_rechazo })` + retornar con campo
   - `getCertificate`, `getCertificates`, `getAllCompanyCertificates`, `appendImages`: propagar `rejectionReason` al construir `Certificate.create()`
3. `Infrastructure/Controllers/Certificates.controller.ts` — Zod schema con `rejectionReason` + `superRefine`
4. `migrations/002_rejection_reason.sql` — `ALTER TABLE certificados ADD COLUMN motivo_rechazo VARCHAR(500) NULL AFTER motivo`

### Fase 3 — Backend: Email templates

**Archivos**:

1. `Infrastructure/utils/Email/Templates/types.ts` — `rejectionReason?` en `ILicenseStatusChange`
2. `Application/Services/SendEmail.service.ts` — `rejectionReason?` en `INotifyLicenseStatusChange` + forwarded en `notifyLicenseStatusChange`
3. `Infrastructure/utils/Email/Templates/licenseStatusChange.template.ts` — fila condicional "Motivo del rechazo"

### Fase 4 — Frontend: hook + modal + component

**Archivos**:

1. `Hooks/useUpdateCertificateStatus.ts` — `mutateUpdate(id, status, rejectionReason?)`
2. `Components/RejectionReasonModal.tsx` — nuevo componente (Dialog + React Hook Form + Zod + contador descendente)
3. `Components/Certificate/CertificateActions.tsx` — interceptar `rechazado` → `useState` local para modal → confirmar con motivo

---

## Decisiones Técnicas Clave

| Decisión                                                                 | Razonamiento                                                                                                                                                                                                                                                                                     |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `superRefine` en el Zod schema del controller (no en el use case)        | Valida en el borde de entrada tRPC; produce error tipado en `path: ['rejectionReason']`; el use case no duplica validación                                                                                                                                                                       |
| `motivo_rechazo` nullable en DB (no NOT NULL)                            | Compatibilidad con registros históricos (FR-008); el NOT NULL se enforce en la capa de aplicación, no en la DB                                                                                                                                                                                   |
| Migration SQL manual en `migrations/` (no `sequelize.sync`)              | Mismo patrón que `001_disclaimer.sql`; sin runner automático en el proyecto; `sync({ alter: true })` es peligroso en producción                                                                                                                                                                  |
| Estado del modal en `CertificateActions` local (`useState`)              | No hay necesidad de prop drilling ni store global; el modal es un detalle de interacción local                                                                                                                                                                                                   |
| `rejectionReason` propagado hasta la entidad (no solo en el repositorio) | `convertToDTO` accede a `certificate.values.rejectionReason`; el service pasa `rejectionReason: input.rejectionReason` directamente desde el input (equivalentes post-usecase). Centralizar en la entidad garantiza que cualquier nuevo consumer del DTO obtenga el campo sin consulta adicional |
| `rejectionReason` omitido del payload para `status !== 'rechazado'`      | Atomicidad (FR-002) — el campo no debe persistirse si el status no es rechazo; el `superRefine` impide enviar `rejectionReason` con un status incorrecto desde el cliente, pero el repositorio también lo ignora si `status !== 'rechazado'`                                                     |

---

## Complejidad Tracking

Sin violaciones constitucionales. Tabla no requerida.
