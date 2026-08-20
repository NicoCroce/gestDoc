---
task_id: 'TASK-006-license-rejection-reason-20260818-1'
agent: 'Reviewer_Agent'
status: 'APPROVED'
attempts: 1
date: '2026-08-18'
---

# Revisión de Estándares — Motivo de rechazo de licencias (modal admin + email empleado)

## Resultado: ✅ APPROVED

---

## Checklist

| #   | Criterio                                | Nivel | Estado | Detalle                                                                                                                                                                           |
| --- | --------------------------------------- | ----- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Domain no importa Infrastructure        | 🔴    | ✅     | `Certificate.entity.ts` solo importa tipos del propio Domain                                                                                                                      |
| 2   | Use Cases usan interfaz abstracta       | 🔴    | ✅     | `UpdateCertificateStatus` inyecta `CertificateRepository` (puerto abstracto)                                                                                                      |
| 3   | Archivos globales actualizados          | 🔴    | ✅     | Sin dominio/rutas nuevos; `certificatesApp` ya spread en `register.ts`; clave DI `_updateCertificateStatus` existe y coincide con el parámetro del constructor                    |
| 4   | Sin `any` explícito                     | 🔴    | ✅     | Solo `expect.any()` en specs (matcher Vitest)                                                                                                                                     |
| 5   | Tipos de retorno explícitos             | 🟡    | ✅     | Use case `Promise<Certificate>`, service `Promise<CertificateDTO>`                                                                                                                |
| 6   | Solo interfaces compartidas entre capas | 🔴    | ✅     | Cross-domain `GetRoleByUser` vía inyección de use case (patrón documentado)                                                                                                       |
| 7   | Zod en controller/formulario            | 🔴    | ✅     | Controller: `z.object(...).superRefine(...)`; modal: RHF + Zod `.trim().min(1).max(500)`                                                                                          |
| 8   | Filtro `ownerId` en queries             | 🔴    | ✅     | `updateCertificateStatus` JOIN con `UserModel where id_propietario = ownerId` (required); propagado en getCertificate/getCertificates/getAllCompanyCertificates/appendImages      |
| 9   | Sin `console.log` en producción         | 🟡    | ✅     | `console.error` en `appendImages` (línea 111) es pre-existente en main — no lo introduce la feature                                                                               |
| 10  | Convenciones de nomenclatura            | 🔴    | ✅     | `rejectionReason` camelCase; `motivo_rechazo` snake DB; clave DI con entidad                                                                                                      |
| 11  | Entidad con `static create()` etc.      | 🟡    | ✅     | `create()`, `toJSON()`, `get values()`, getter `rejectionReason`                                                                                                                  |
| 12  | Pantallas con error/loading/empty       | 🔴    | ✅     | N/A — sin pantallas nuevas de fetch; modal es mutation-driven                                                                                                                     |
| 13  | Sin texto inline para estados           | 🔴    | ✅     | N/A — sin estados de query en código nuevo                                                                                                                                        |
| 14  | Botones con `isLoading`                 | 🔴    | ✅     | Submit "Rechazar" con `isLoading={isPending}`; "Cancelar" con `disabled={isPending}` (patrón correcto). Botón delete pre-existente sin `isLoading` — deuda, no lo toca la feature |
| 15  | Empty states usan `EmptyState`          | 🟡    | ✅     | N/A                                                                                                                                                                               |
| 16  | Skeletons en Components/ del dominio    | 🟡    | ✅     | N/A                                                                                                                                                                               |
| 17  | Barrels exportan correctamente          | 🟡    | ✅     | `Components/index.ts` agrega `RejectionReasonModal`; barrels del server sin cambios                                                                                               |

---

## Deuda Técnica (seguimiento requerido)

1. **Migración T001 pendiente de aplicar (BLOQUEANTE para deploy)** — `002_rejection_reason.sql` existe y es correcto, pero el DDL no se aplicó a `dev_macrogest` (MCP MySQL con `SCHEMA_DDL_PERMISSIONS` deshabilitado). Sin la columna `motivo_rechazo`, toda query sobre `certificados` falla en runtime. Aplicar antes de iniciar el servidor: `ALTER TABLE certificados ADD COLUMN motivo_rechazo VARCHAR(500) NULL AFTER motivo;`
2. **Casts defensivos en `DisclaimerModal.tsx` (líneas 17 y 49)** — fix de tipos pre-existente, ajeno a la feature, necesario para desbloquear QA. Causa raíz: `.d.ts` stale en `packages/server/dist/` (project reference del tsconfig de app). `as never` es un escape hatch de tipos que enmascara el mismatch real. **Aceptado como stopgap** — seguimiento: rebuild del server (`pnpm --filter server build`) para regenerar `.d.ts`, verificar que el archivo compila sin casts y revertirlos. Considerar en CI: buildear server antes de `tsc` de app.
3. **`console.error` en `CertificatesRepository.implementation.ts:111`** (pre-existente) — migrar al patrón `loggerContext` del proyecto en una tarea futura.
4. **`RejectionReasonModal.tsx:89`** — usa `<div className="... flex flex-col ...">` en lugar de `<Container>` (restricción 6 de `app.instructions.md`). No bloquea; alinear en refactor de pulido.
5. **Label del modal** usa `text-[#EF4444]` donde `frontend-design.md` especifica `text-[#64748B]` para la etiqueta — desvío menor del token de diseño.
6. **Botón "Eliminar" de `CertificateActions`** (pre-existente) usa `disabled={isDeleting}` + texto condicional en vez de `isLoading` — alinear con el patrón de la regla 14 en tarea futura.
