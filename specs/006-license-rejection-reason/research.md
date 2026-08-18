# Research: License Rejection Reason

**Feature Branch**: `006-license-rejection-reason`
**Date**: 2026-08-18
**Status**: Complete — all NEEDS CLARIFICATION resolved

---

## 1. Conditional Zod validation en el controller

**Decision**: Usar `.superRefine()` en el schema del controller para hacer `rejectionReason` obligatorio cuando `status === 'rechazado'`.

**Rationale**: `.superRefine()` permite agregar errores tipados en campos específicos (`path: ['rejectionReason']`), lo que produce un `ZodError` con el path correcto que tRPC transforma en un `BAD_REQUEST` descriptivo. La alternativa, `.refine()`, no soporta el path customizado en versiones de Zod 4 y puede producir errores en el campo raíz del objeto.

**Alternativas consideradas**:

- Validar en el use case y lanzar `AppError` — produce error HTTP 400, pero la validación no llega al cliente tRPC tipada; requiere duplicar lógica de validación.
- Campo separado como `.nullish()` sin refine — viola FR-002: el status podría cambiar a `rechazado` sin motivo desde una llamada directa.

**Pattern de implementación**:

```ts
z.object({
  id: z.number(),
  status: z.enum(['aprobado', 'rechazado', 'pendiente', 'validando']),
  rejectionReason: z.string().max(500).optional(),
}).superRefine((data, ctx) => {
  if (data.status === 'rechazado' && !data.rejectionReason?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'El motivo de rechazo es obligatorio',
      path: ['rejectionReason'],
    });
  }
});
```

---

## 2. Migración de base de datos

**Decision**: SQL plano en `packages/server/src/migrations/002_rejection_reason.sql` — mismo patrón que `001_disclaimer.sql`.

**Rationale**: El proyecto no usa un runner de migraciones automático (Sequelize CLI, Umzug). La convención establecida es un archivo SQL numerado por feature. El `CertificateModel` en Sequelize se actualiza en paralelo para sincronizar la definición TypeScript sin `sync({ alter: true })`.

**Alternativas consideradas**:

- `sequelize.sync({ alter: true })` — peligroso en producción: puede truncar datos.
- Umzug — introduce una dependencia nueva sin valor inmediato; la convención actual es suficiente para el volumen actual.

**DDL**:

```sql
ALTER TABLE certificados
  ADD COLUMN motivo_rechazo VARCHAR(500) NULL
  AFTER motivo;
```

---

## 3. Nombre de columna en la DB

**Decision**: `motivo_rechazo` (snake_case español) — consistente con el patrón de la tabla `certificados` (`motivo`, `estado`, `requiere_reposo`, `fecha_inicio`, etc.).

**Rationale**: Todos los campos existentes de la tabla siguen snake_case en español. Mezclar con camelCase inglés introduciría inconsistencia en el esquema.

---

## 4. Propagación del campo por las capas

**Decision**: Flujo unidireccional top-down: Controller schema → `IUpdateCertificateStatus.input` → Use case → `IUpdateCertificateStatusRepository` → Repositorio → entidad `Certificate` → DTO.

**Rationale**: Ninguna capa puede "inventar" el campo; cada capa lo recibe de la anterior. El campo es opcional en todas las interfaces excepto en la capa de presentación para el caso `rechazado` (enforced por Zod con `superRefine`).

---

## 5. Entidad de dominio: campo `_rejectionReason`

**Decision**: Agregar `_rejectionReason?: string` al constructor de `Certificate` y exponerlo en `values` y con un getter propio.

**Rationale**: La entidad ya expone `status` con getter dedicado. El `rejectionReason` debe ser accesible en `certificate.values` para que el `convertToDTO` lo incluya en el DTO, y para que `SendEmailService` acceda a él via `certificate.values.rejectionReason`.

---

## 6. Email: sección condicional de rechazo

**Decision**: Agregar un bloque HTML condicional `rejectionReason` al final de la tabla en `licenseStatusChange.template.ts`. La condición se evalúa en la función de template: `rejectionReason && status === 'rechazado'`.

**Rationale**: El template ya recibe `status`; solo necesita recibir `rejectionReason?: string` adicional. La condición en el template es la forma más simple de cumplir FR-007 (no mostrar la sección para `aprobado`) y FR-008 (registros históricos sin `rejectionReason` no rompen nada — el campo es `undefined`/`null`).

---

## 7. Frontend: gestión de estado del modal

**Decision**: El estado `isRejectionModalOpen` y `pendingRejectionCertificateId` vive dentro de `CertificateActions` como `useState` local — no se eleva al store global ni a la página padre.

**Rationale**: El modal es un detalle de interacción del componente `CertificateActions`. Elevar el estado a la página requeriría prop drilling a través de `CertificatesGrid` → `Certificate` → `CertificateActions`, sin beneficio de reutilización.

**Alternativas consideradas**:

- Estado en la página — prop drilling innecesario.
- Zustand store — overkill para estado de UI local transitorio.

---

## 8. Validación frontend: ¿dónde vive el schema Zod del formulario?

**Decision**: El schema `rejectionReasonSchema` vive dentro de `RejectionReasonModal.tsx` (no se comparte con el backend).

**Rationale**: El campo `rejectionReason` ya es validado por Zod en el server en la procedure input. El schema del cliente es una copia ligera (`z.string().min(1).max(500)`) para UX — no necesita ser el mismo schema del server, no se exporta.

---

## 9. Atomicidad status + rejectionReason (FR-002)

**Decision**: Status y `rejectionReason` se envían en la misma llamada a `updateCertificateStatus`. No se crean dos endpoints separados.

**Rationale**: FR-002 exige que el status no cambie sin el motivo y viceversa. Una sola transacción al servidor (un `mutate`) garantiza la atomicidad a nivel de red. La atomicidad a nivel DB está garantizada por el `certificate.update({ estado, motivo_rechazo })` en el repositorio.
