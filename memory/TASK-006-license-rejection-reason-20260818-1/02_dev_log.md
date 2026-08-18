---
task_id: 'TASK-006-license-rejection-reason-20260818-1'
agent: 'Front_Agent'
status: 'IMPLEMENTED'
attempts: 2
date: '2026-08-18'
affected_files:
  - 'packages/server/src/migrations/002_rejection_reason.sql'
  - 'packages/server/src/domains/Certificates/Domain/Certificate.types.ts'
  - 'packages/server/src/domains/Certificates/Domain/Certificate.entity.ts'
  - 'packages/server/src/domains/Certificates/Domain/Certificate.respository.ts'
  - 'packages/server/src/domains/Certificates/Application/certificates.types.ts'
  - 'packages/server/src/domains/Certificates/Application/DTO/CertificateDTO.ts'
  - 'packages/server/src/domains/Certificates/Application/digest.ts'
  - 'packages/server/src/domains/Certificates/Application/UseCases/UpdateCertificateStatus.usecase.ts'
  - 'packages/server/src/domains/Certificates/Application/Certificates.service.ts'
  - 'packages/server/src/domains/Certificates/Infrastructure/Controllers/Certificates.controller.ts'
  - 'packages/server/src/domains/Certificates/Infrastructure/Databases/Certificates.model.ts'
  - 'packages/server/src/domains/Certificates/Infrastructure/Databases/CertificatesRepository.implementation.ts'
  - 'packages/server/src/Infrastructure/utils/Email/Templates/types.ts'
  - 'packages/server/src/Application/Services/SendEmail.service.ts'
  - 'packages/server/src/Infrastructure/utils/Email/Templates/licenseStatusChange.template.ts'
  - 'packages/app/src/Domains/Certificates/Hooks/useUpdateCertificateStatus.ts'
  - 'packages/app/src/Domains/Certificates/Components/RejectionReasonModal.tsx'
  - 'packages/app/src/Domains/Certificates/Components/Certificate/CertificateActions.tsx'
  - 'packages/app/src/Domains/Disclaimer/DisclaimerModal.tsx' # Fix de tipos pre-existente en main, ajeno a la feature
---

# Log de Desarrollo — License Rejection Reason (Backend + Frontend)

## Archivos Creados

| Archivo                                                                     | Capa                  | Motivo                                                                          |
| --------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------- |
| `packages/server/src/migrations/002_rejection_reason.sql`                   | Infrastructure        | Artefacto de documentación SQL para la migración de la columna `motivo_rechazo` |
| `packages/app/src/Domains/Certificates/Components/RejectionReasonModal.tsx` | Frontend / Components | T014: Nuevo componente Dialog con RHF + Zod para capturar el motivo de rechazo  |

## Archivos Modificados

| Archivo                                                                                                      | Cambio aplicado                                                                                                                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/server/src/domains/Certificates/Domain/Certificate.types.ts`                                       | T002: Agregado `rejectionReason?: string` a `ICertificate`                                                                                                                                                                                                                         |
| `packages/server/src/domains/Certificates/Domain/Certificate.entity.ts`                                      | T003: Nuevo parámetro `_rejectionReason?: string` en constructor, incluido en `create()`, `values` getter, y getter propio `rejectionReason`                                                                                                                                       |
| `packages/server/src/domains/Certificates/Domain/Certificate.respository.ts`                                 | T004: Agregado `rejectionReason?: string` a `IUpdateCertificateStatusRepository`                                                                                                                                                                                                   |
| `packages/server/src/domains/Certificates/Application/certificates.types.ts`                                 | T005: Agregado `rejectionReason?: string` al `input` de `IUpdateCertificateStatus`                                                                                                                                                                                                 |
| `packages/server/src/domains/Certificates/Application/DTO/CertificateDTO.ts`                                 | T006: Agregado `rejectionReason?: string` a `CertificateDTO`                                                                                                                                                                                                                       |
| `packages/server/src/domains/Certificates/Application/digest.ts`                                             | T007: Destructurado `rejectionReason` de `certificate.values`; incluido en el DTO de retorno via spread condicional                                                                                                                                                                |
| `packages/server/src/domains/Certificates/Application/UseCases/UpdateCertificateStatus.usecase.ts`           | T008: Forwarded `rejectionReason: input.rejectionReason` en la llamada al repositorio                                                                                                                                                                                              |
| `packages/server/src/domains/Certificates/Application/Certificates.service.ts`                               | T012: Pasado `rejectionReason: input.rejectionReason` en la llamada a `notifyLicenseStatusChange`                                                                                                                                                                                  |
| `packages/server/src/domains/Certificates/Infrastructure/Controllers/Certificates.controller.ts`             | T011: Agregado `rejectionReason: z.string().max(500).optional()` al schema Zod de `updateCertificateStatus` + `superRefine` que valida que el motivo sea obligatorio cuando `status === 'rechazado'`                                                                               |
| `packages/server/src/domains/Certificates/Infrastructure/Databases/Certificates.model.ts`                    | T009: Declarado `motivo_rechazo: CreationOptional<string \| null>` como class field; agregado a `CertificateModel.init()` como `DataTypes.STRING(500)` nullable con `defaultValue: null`                                                                                           |
| `packages/server/src/domains/Certificates/Infrastructure/Databases/CertificatesRepository.implementation.ts` | T010: `updateCertificateStatus` actualizado con spread condicional `motivo_rechazo`; propagado `rejectionReason: certificate.motivo_rechazo ?? undefined` en todos los `Certificate.create()` de `getCertificate`, `getCertificates`, `getAllCompanyCertificates` y `appendImages` |
| `packages/server/src/Infrastructure/utils/Email/Templates/types.ts`                                          | T016: Agregado `rejectionReason?: string` a `ILicenseStatusChange`                                                                                                                                                                                                                 |
| `packages/server/src/Application/Services/SendEmail.service.ts`                                              | T017: Agregado `rejectionReason?: string` a `INotifyLicenseStatusChange`; forwarded al template `emailTemplates.licenseStatusChange(...)`                                                                                                                                          |
| `packages/server/src/Infrastructure/utils/Email/Templates/licenseStatusChange.template.ts`                   | T018: Agregada fila HTML condicional `Motivo del rechazo` renderizada solo cuando `status === 'rechazado' && rejectionReason`                                                                                                                                                      |
| `packages/app/src/Domains/Certificates/Hooks/useUpdateCertificateStatus.ts`                                  | T013: Extendido `mutateUpdate` para aceptar `rejectionReason?: string` como tercer argumento; incluido en el payload de la mutation via spread condicional                                                                                                                         |
| `packages/app/src/Domains/Certificates/Components/Certificate/CertificateActions.tsx`                        | T015: Añadido `useState` para `modalOpen` y `pendingStatus`; intercepción de `'rechazado'` para abrir modal; submit con reason en `handleModalConfirm`; revert de select en `handleModalCancel`; render condicional de `RejectionReasonModal`                                      |
| `packages/app/src/Domains/Certificates/Components/index.ts`                                                  | Barrel: agregado export de `RejectionReasonModal`                                                                                                                                                                                                                                  |

## Decisiones Técnicas — Backend

- **Spread condicional en `digest.ts`**: Se usa `...(rejectionReason !== undefined ? { rejectionReason } : {})` en lugar de siempre incluir el campo para que el DTO no exponga la key con `undefined` explícito — coherente con el contrato del endpoint (campo presente solo en rechazos).
- **`motivo_rechazo ?? undefined` en el repositorio**: Sequelize puede retornar `null` para columnas nullable. Se normaliza a `undefined` para que la entidad `Certificate` nunca tenga `rejectionReason: null` en su interfaz pública — el tipo es `string | undefined`, no `string | null`.
- **`motivo_rechazo` en `getAllCompanyCertificates`**: El retorno de ese método es `IGetAllCompanyCertificatesRepositoryResponse[]` (extendiendo `ICertificate`), que ahora incluye `rejectionReason?`. Se destructura `motivo_rechazo` del modelo y se incluye en el objeto inline.
- **Spread condicional en `updateCertificateStatus` del repositorio**: `...(rejectionReason !== undefined ? { motivo_rechazo: rejectionReason } : {})` garantiza que la columna nunca se sobreescriba con `undefined` si el cliente omite el campo (status no-rechazo). La columna de DB permanece `NULL` para esos registros.
- **`superRefine` en el controller (no en el use case)**: Valida en el borde tRPC de entrada; produce un `ZodError` con `path: ['rejectionReason']` antes de que el request llegue al dominio.
- **T001 — DDL bloqueado por MCP**: El servidor MySQL MCP tiene `SCHEMA_DDL_PERMISSIONS` deshabilitado para `dev_macrogest`. El archivo SQL fue creado como artefacto de documentación. La migración debe aplicarse manualmente ejecutando `002_rejection_reason.sql` contra la base de datos antes de iniciar el servidor en producción.

## Decisiones Técnicas — Frontend

- **Spread condicional en `mutateUpdate`**: `...(rejectionReason !== undefined ? { rejectionReason } : {})` — se omite la key del payload cuando el status no es rechazo, coherente con el contrato del controller.
- **`reset()` en `useEffect([open])`**: El formulario se resetea cada vez que el modal abre, garantizando que una apertura posterior a un cancel no muestre texto anterior.
- **`onOpenChange` del Dialog**: Se llama a `onCancel()` si el usuario cierra con Escape/click-fuera, pero solo cuando `!isPending` para no interrumpir un submit en curso.
- **Valor del Select durante modal abierto**: Mientras `modalOpen` es `true`, el `value` del Select muestra `pendingStatus` (i.e. `'rechazado'`) para que visualmente el dropdown ya muestre el nuevo estado. Al cancelar, `pendingStatus` vuelve a `null` y el Select regresa al `certificate.status` original — sin necesidad de manipular el valor directamente.
- **`<>` fragment en admin variant**: `CertificateActions` retorna un `Fragment` (no un `Container`) para envolver el `Container` del dropdown+delete y el `RejectionReasonModal`, que es un Dialog teleportado al `body` — no necesita estar dentro del layout de la fila.

## Iteración 2 — Fix de tipos pre-existente fuera de scope

**Contexto:** QA bloqueó por errores TS pre-existentes en `packages/app/src/Domains/Disclaimer/DisclaimerModal.tsx` (líneas 14 y 44). El archivo NO pertenece a la feature `license-rejection-reason`.

**Causa raíz:** `packages/server/dist/*.d.ts` están desactualizados (build del 17-08 19:53 vs. source del controller modificado el 17-08 22:24). El `tsconfig.json` de `packages/app` usa project reference al server (composite), por lo que tsc resuelve los tipos del router desde los `.d.ts` stale: `disclaimer.getText` aparece como `input: void`, `output: { content: string; version: number | null }`, cuando el server real es `(input: number) => string`. Los `.d.ts` stale están en `dist/` (gitignored) y se regeneran al buildear el server.

**Fix aplicado (solo tipos, sin cambio de comportamiento):**

| Línea | Antes                                           | Después                                                                                                                                                                                                                           |
| ----- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 14    | `useGetDisclaimerText()(ownerId!, { enabled })` | `useGetDisclaimerText()(ownerId! as never, { enabled })` — cast `as never` (mismo patrón ya usado en `DisclaimerForm.tsx` línea 39) que satisface el overload `input: void` stale sin alterar el valor runtime (`ownerId` número) |
| 44    | `{disclaimerText \|\| 'No hay términos...'}`    | `{(disclaimerText as unknown as string \| undefined) \|\| 'No hay términos...'}` — el runtime real es `string` (server actual); el cast alinea el tipo con ReactNode                                                              |

**Verificación:** `cd packages/app && npx tsc --noEmit` → 0 errores (exit 0).

## Deuda Técnica Conocida

- **Migración T001 pendiente de aplicar**: La columna `motivo_rechazo` aún no existe en la DB `dev_macrogest` porque el MCP MySQL rechazó el DDL. Aplicar antes del deploy: `ALTER TABLE certificados ADD COLUMN motivo_rechazo VARCHAR(500) NULL AFTER motivo;`
