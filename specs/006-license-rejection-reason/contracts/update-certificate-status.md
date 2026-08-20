# Contract: updateCertificateStatus

**Procedure**: `certificates.updateCertificateStatus`
**Type**: tRPC Mutation — `protectedProcedure`
**Feature**: `006-license-rejection-reason`

---

## Input Schema (Zod)

```typescript
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

### Campos de entrada

| Campo             | Tipo                                                      | Requerido                      | Reglas                                                                                                           |
| ----------------- | --------------------------------------------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `id`              | `number`                                                  | Sí                             | ID del certificado a actualizar                                                                                  |
| `status`          | `'aprobado' \| 'rechazado' \| 'pendiente' \| 'validando'` | Sí                             | No acepta `'eliminado'` — ese estado se obtiene vía `deleteCertificate`                                          |
| `rejectionReason` | `string` (max 500)                                        | Sí si `status === 'rechazado'` | Obligatorio y no vacío/whitespace cuando `status` es `'rechazado'`; ignorado y debe omitirse para otros statuses |

### Errores de validación Zod (400 BAD_REQUEST)

| Condición                                                    | `path`                | `message`                                      |
| ------------------------------------------------------------ | --------------------- | ---------------------------------------------- |
| `status === 'rechazado'` y `rejectionReason` ausente o vacío | `['rejectionReason']` | `El motivo de rechazo es obligatorio`          |
| `rejectionReason.length > 500`                               | `['rejectionReason']` | `String must contain at most 500 character(s)` |

---

## Output (CertificateDTO)

```typescript
type CertificateDTO = {
  id: number;
  startDate: string; // ISO date string "YYYY-MM-DD"
  endDate: string; // ISO date string "YYYY-MM-DD"
  returnDate: string; // ISO date string "YYYY-MM-DD"
  reason: string;
  type: string; // Nombre del tipo de licencia
  requiresRest: boolean;
  status: 'aprobado' | 'rechazado' | 'pendiente' | 'validando' | 'eliminado';
  files?: string[];
  rejectionReason?: string; // Presente si status === 'rechazado'; undefined en los demás casos
};
```

---

## Errores del servidor (AppError → tRPCErrorAdapter)

| Código HTTP | Code        | Condición                                                       |
| ----------- | ----------- | --------------------------------------------------------------- |
| 404         | `NOT_FOUND` | El certificado no existe o no pertenece al `ownerId` del caller |
| 403         | `FORBIDDEN` | El certificado tiene `status === 'eliminado'`                   |
| 403         | `FORBIDDEN` | El usuario autenticado no tiene rol admin                       |

---

## Comportamiento multi-tenant

El repositorio valida que el certificado pertenezca a un usuario del `ownerId` del `RequestContext` mediante un JOIN con `UserModel` filtrado por `id_propietario`. Un certificado de otro tenant produce `404 NOT_FOUND` (IDOR prevention — no revela existencia).

---

## Efectos secundarios (fire-and-forget)

| Condición                | Efecto                                                                           |
| ------------------------ | -------------------------------------------------------------------------------- |
| `status === 'aprobado'`  | Envía email de notificación al empleado (sin `rejectionReason`)                  |
| `status === 'rechazado'` | Envía email de notificación al empleado con sección "Motivo del rechazo" visible |

El envío de email es fire-and-forget: un fallo en el email **no** revierte el cambio de estado ni produce error en la respuesta HTTP.

---

## Comparación: antes vs. después

|                          | Antes                 | Después                                       |
| ------------------------ | --------------------- | --------------------------------------------- |
| Input `rejectionReason`  | ❌ No existía         | ✅ Opcional, requerido para `rechazado`       |
| Output `rejectionReason` | ❌ No incluido en DTO | ✅ Presente en `CertificateDTO` cuando aplica |
| Validación inline        | Solo `id` y `status`  | `superRefine` + max 500                       |
| Email para `rechazado`   | Sin sección de motivo | Con sección "Motivo del rechazo" condicional  |
| DB                       | Sin columna           | `motivo_rechazo VARCHAR(500) NULL`            |

---

## Ejemplo de uso (cliente tRPC)

```typescript
// Rechazo con motivo — válido
await trpc.certificates.updateCertificateStatus.mutate({
  id: 42,
  status: 'rechazado',
  rejectionReason: 'La documentación adjunta está incompleta.',
});

// Aprobación — rejectionReason no se envía
await trpc.certificates.updateCertificateStatus.mutate({
  id: 42,
  status: 'aprobado',
});

// Error: rechazado sin motivo — el servidor responde 400
await trpc.certificates.updateCertificateStatus.mutate({
  id: 42,
  status: 'rechazado',
  // rejectionReason omitido → ZodError path: ['rejectionReason']
});
```
