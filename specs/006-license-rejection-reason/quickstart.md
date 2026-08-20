# Quickstart: License Rejection Reason

**Feature Branch**: `006-license-rejection-reason`
**Date**: 2026-08-18

Guía de validación end-to-end para verificar que la feature funciona correctamente.

---

## Prerequisitos

- Rama `006-license-rejection-reason` en checkout
- MySQL corriendo con la migración `002_rejection_reason.sql` aplicada
- Servidor y app en dev: `pnpm server:dev` y `pnpm app:dev`
- Al menos un certificado en estado `pendiente` visible en `admin/dashboard-licenses`

---

## Setup: aplicar la migración

```bash
# Conectarse a la DB de desarrollo y ejecutar
mysql -u <user> -p <database> < packages/server/src/migrations/002_rejection_reason.sql
```

Verificar:

```sql
SHOW COLUMNS FROM certificados LIKE 'motivo_rechazo';
-- Debe mostrar: motivo_rechazo | varchar(500) | YES | NULL
```

---

## Escenario 1 — Modal aparece al seleccionar "Rechazado" (US1, AC1)

1. Abrir `admin/dashboard-licenses` como admin
2. En el dropdown de estado de cualquier licencia `pendiente`, seleccionar **Rechazado**
3. **Esperado**: aparece el modal `RejectionReasonModal` con el textarea vacío y el contador en `500 restantes`

---

## Escenario 2 — Submit bloqueado con motivo vacío (US1, AC3)

1. Con el modal abierto del escenario 1
2. No completar el textarea
3. Hacer click en **Rechazar**
4. **Esperado**:
   - El formulario no se envía (sin request HTTP)
   - Aparece error inline bajo el textarea
   - El status del certificado NO cambia en la lista

---

## Escenario 3 — Rechazo exitoso con motivo (US1, AC2)

1. Con el modal abierto, tipear un motivo: `"La documentación adjunta está incompleta"`
2. Hacer click en **Rechazar**
3. **Esperado**:
   - El botón muestra spinner mientras se envía
   - Al completar: modal se cierra, toast de éxito, el certificado aparece como `rechazado` en la lista
   - En DB: `SELECT motivo_rechazo FROM certificados WHERE id = <id>` devuelve el texto ingresado

---

## Escenario 4 — Cancelar revierte el dropdown (US1, AC4)

1. Abrir el modal seleccionando "Rechazado"
2. Click en **Cancelar** (o cerrar el modal)
3. **Esperado**: el dropdown revierte al valor anterior; sin request HTTP; sin cambio en DB

---

## Escenario 5 — Otros estados no muestran modal (US1, AC5)

1. Seleccionar **Aprobado** o **Validando** en el dropdown
2. **Esperado**: el cambio de estado se envía inmediatamente (sin modal); comportamiento idéntico al pre-feature

---

## Escenario 6 — Email de rechazo incluye el motivo (US2, AC1)

1. Completar el escenario 3 con un motivo visible
2. Verificar el email recibido por el empleado (servidor de correo de dev / Mailtrap)
3. **Esperado**: el body del email incluye una fila **"Motivo del rechazo"** con el texto exacto ingresado

---

## Escenario 7 — Email de aprobación NO incluye motivo (US2, AC2)

1. Aprobar una licencia (cambiar a `aprobado`)
2. Verificar el email del empleado
3. **Esperado**: no aparece sección "Motivo del rechazo" en el email

---

## Escenario 8 — Validación del límite de caracteres (Edge Case)

1. En el modal, pegar texto de 501 caracteres en el textarea
2. **Esperado**: el `maxLength={500}` del textarea bloquea el input; el contador muestra `0 restantes` (no va en negativo); intentar enviar produce error de validación

---

## Validación de tipos TypeScript

```bash
pnpm tsc
# Esperado: 0 errores
```

---

## Validación de tests

```bash
pnpm test --filter certificates
# Esperado: todos los tests pasan, incluyendo los nuevos tests del use case UpdateCertificateStatus
```

Para detalles de contratos y modelo ver:

- [`data-model.md`](./data-model.md)
- [`contracts/update-certificate-status.md`](./contracts/update-certificate-status.md)
