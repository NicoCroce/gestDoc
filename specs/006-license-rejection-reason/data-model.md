# Data Model: License Rejection Reason

**Feature Branch**: `006-license-rejection-reason`
**Date**: 2026-08-18

---

## Entidad `Certificate` — Cambios

### Campo nuevo: `rejectionReason`

| Propiedad                       | Valor                                                                           |
| ------------------------------- | ------------------------------------------------------------------------------- |
| Nombre en dominio               | `rejectionReason`                                                               |
| Tipo TypeScript                 | `string \| undefined`                                                           |
| Obligatoriedad                  | Requerido cuando `status === 'rechazado'`; `undefined` en todos los demás casos |
| Máximo de caracteres            | 500                                                                             |
| Valor para registros históricos | `undefined` (columna nullable) — no produce error en ningún flujo               |

### Archivos afectados

#### `Domain/Certificate.types.ts`

```typescript
export interface ICertificate {
  id?: number;
  startDate: Date;
  endDate: Date;
  returnDate: Date;
  reason: string;
  type: CertificateTypes;
  files?: string[];
  requiresRest: boolean;
  status?: CertificateStatus;
  userId?: number;
  rejectionReason?: string; // ← NUEVO
}
```

#### `Domain/Certificate.entity.ts`

Cambios al constructor, `create()`, `values` y getter:

```typescript
export class Certificate {
  constructor(
    private readonly _startDate: Date,
    private readonly _endDate: Date,
    private readonly _returnDate: Date,
    private readonly _reason: string,
    private readonly _type: CertificateTypes,
    private readonly _requiresRest: boolean,
    private readonly _status: CertificateStatus,
    private readonly _files?: string[],
    private readonly _id?: number,
    private readonly _userId?: number,
    private readonly _rejectionReason?: string, // ← NUEVO (último para no romper callers existentes)
  ) {}

  static create({
    id,
    startDate,
    endDate,
    returnDate,
    reason,
    type,
    files,
    requiresRest,
    status,
    userId,
    rejectionReason, // ← NUEVO
  }: ICertificate): Certificate {
    // ... validaciones sin cambios ...
    return new Certificate(
      startDate,
      endDate,
      returnDate,
      reason,
      typeInstance,
      requiresRest ?? false,
      status ?? 'pendiente',
      files,
      id,
      userId,
      rejectionReason, // ← NUEVO
    );
  }

  get values() {
    return {
      id: this._id,
      startDate: this._startDate,
      endDate: this._endDate,
      returnDate: this._returnDate,
      reason: this._reason,
      type: this._type,
      requiresRest: this._requiresRest,
      status: this._status,
      files: this._files,
      rejectionReason: this._rejectionReason, // ← NUEVO
    };
  }

  get rejectionReason() {
    // ← NUEVO
    return this._rejectionReason;
  }
  // ... resto sin cambios ...
}
```

#### `Application/DTO/CertificateDTO.ts`

```typescript
export interface CertificateDTO {
  id: number;
  startDate: string;
  endDate: string;
  returnDate: string;
  reason: string;
  type: string;
  requiresRest: boolean;
  status: CertificateStatus;
  files?: string[];
  rejectionReason?: string; // ← NUEVO
}
```

#### `Application/digest.ts`

```typescript
export const convertToDTO = (certificate: Certificate) => {
  const {
    id,
    startDate,
    endDate,
    returnDate,
    type,
    reason,
    requiresRest,
    status,
    files,
    rejectionReason, // ← NUEVO
  } = certificate.values;

  return {
    id: id!,
    startDate: getDateString(startDate),
    endDate: getDateString(endDate),
    returnDate: getDateString(returnDate),
    reason,
    type: type.values.name || '',
    requiresRest,
    status: status ?? 'pendiente',
    files,
    rejectionReason, // ← NUEVO (undefined para registros sin motivo)
  };
};
```

---

## Modelo Sequelize — Cambios

### `Infrastructure/Databases/Certificates.model.ts`

Nueva declaración de campo:

```typescript
// Añadir en las declaraciones de campos del modelo
declare;
motivo_rechazo: CreationOptional<string | null>;
```

Nueva columna en `CertificateModel.init(...)`:

```typescript
motivo_rechazo: {
  type: DataTypes.STRING(500),
  allowNull: true,
  defaultValue: null,
},
```

### Tabla: `certificados`

| Campo            | Tipo MySQL     | NULL | Default | Posición       |
| ---------------- | -------------- | ---- | ------- | -------------- |
| `motivo_rechazo` | `VARCHAR(500)` | YES  | `NULL`  | `AFTER motivo` |

---

## Migration SQL

**Archivo**: `packages/server/src/migrations/002_rejection_reason.sql`

```sql
-- ============================================================
-- Migration 002: License Rejection Reason
-- ============================================================
-- Adds nullable column motivo_rechazo to certificados table.
-- Existing rows remain unaffected (NULL = no rejection reason on file).

ALTER TABLE certificados
  ADD COLUMN motivo_rechazo VARCHAR(500) NULL
  AFTER motivo;
```

---

## Repositorio — Cambios en la capa Infrastructure

### `Domain/Certificate.respository.ts`

```typescript
export interface IUpdateCertificateStatusRepository extends IRequestContext {
  id: number;
  status: CertificateStatus;
  rejectionReason?: string; // ← NUEVO
}
```

### `Infrastructure/Databases/CertificatesRepository.implementation.ts`

En `updateCertificateStatus`:

```typescript
async updateCertificateStatus({
  id, status, requestContext,
  rejectionReason,   // ← NUEVO
}: IUpdateCertificateStatusRepository): Promise<Certificate> {
  // ...find con include sin cambios...

  // Actualización atómica: status + rejectionReason en un solo UPDATE
  await certificate.update({
    estado: status,
    ...(rejectionReason !== undefined
      ? { motivo_rechazo: rejectionReason }
      : {}),
  });

  return Certificate.create({
    id: certificate.id,
    startDate: certificate.fecha_inicio,
    endDate: certificate.fecha_fin,
    returnDate: certificate.fecha_reintegro,
    reason: certificate.motivo,
    type: CertificateTypes.create({
      id: certificate.CertificatesTypesModel.id,
      name: certificate.CertificatesTypesModel.denominacion,
    }),
    requiresRest: Boolean(certificate.requiere_reposo),
    status: certificate.estado,
    files: certificate.archivos,
    userId: certificate.id_usuario,
    rejectionReason: certificate.motivo_rechazo ?? undefined,   // ← NUEVO
  });
}
```

> **Nota**: `getCertificate`, `getCertificates`, `getAllCompanyCertificates` y `appendImages` también deben incluir `rejectionReason: certificate.motivo_rechazo ?? undefined` al construir el `Certificate.create(...)` retornado, para no perder el campo si el registro ya existe.

---

## Application — Cambios en types y use case

### `Application/certificates.types.ts`

```typescript
export interface IUpdateCertificateStatus extends IRequestContext {
  input: {
    id: number;
    status: CertificateStatus;
    rejectionReason?: string; // ← NUEVO
  };
}
```

### `Application/UseCases/UpdateCertificateStatus.usecase.ts`

```typescript
async execute({ input, requestContext }: IUpdateCertificateStatus): Promise<Certificate> {
  // ...validaciones sin cambios...

  return this.certificatesRepository.updateCertificateStatus({
    id: input.id,
    status: input.status,
    rejectionReason: input.rejectionReason,   // ← NUEVO (forwarded)
    requestContext,
  });
}
```

### `Application/Certificates.service.ts`

En `updateCertificateStatus`:

```typescript
async updateCertificateStatus({ input, requestContext }: IUpdateCertificateStatus) {
  const certificate = await executeUseCase({
    useCase: this._updateCertificateStatus,
    input,
    requestContext,
    inputLog: { id: input.id, status: input.status },
  });

  if (input.status === 'aprobado' || input.status === 'rechazado') {
    this.sendEmailService.notifyLicenseStatusChange({
      requestContext,
      certificate,
      newStatus: input.status,
      rejectionReason: input.rejectionReason,   // ← NUEVO
    });
  }

  return convertToDTO(certificate);
}
```

---

## Email — Cambios en templates

### `Infrastructure/utils/Email/Templates/types.ts`

```typescript
export interface ILicenseStatusChange {
  employeeName: string;
  reviewerName: string;
  licenseType: string;
  startDate: string;
  endDate: string;
  returnDate: string;
  reason: string;
  status: 'aprobado' | 'rechazado';
  rejectionReason?: string; // ← NUEVO
}
```

### `Application/Services/SendEmail.service.ts`

```typescript
interface INotifyLicenseStatusChange extends IRequestContext {
  certificate: Certificate;
  newStatus: 'aprobado' | 'rechazado';
  rejectionReason?: string; // ← NUEVO
}
```

En `notifyLicenseStatusChange`:

```typescript
const { body, subject } = emailTemplates.licenseStatusChange({
  employeeName,
  reviewerName,
  licenseType: type.values.name ?? '',
  startDate: getDateString(startDate),
  endDate: getDateString(endDate),
  returnDate: getDateString(returnDate),
  reason,
  status: newStatus,
  rejectionReason, // ← NUEVO
});
```

### `Infrastructure/utils/Email/Templates/licenseStatusChange.template.ts`

Agregar fila condicional al final de la tabla, antes de `${emailFooter}`:

```typescript
${
  status === 'rechazado' && rejectionReason
    ? `<tr>
        <td style="padding: 6px 12px 6px 0; font-weight: bold; color: #374151;">Motivo del rechazo</td>
        <td style="padding: 6px 0; color: #991b1b;">${rejectionReason}</td>
       </tr>`
    : ''
}
```

---

## Frontend — Tipos inferidos

### `Certificate.entity.ts` (frontend)

No requiere cambio manual. `TCertificate` se deriva de `inferRouterOutputs<TCertificatesRouter>`, que apunta a `addCertificate`. El campo `rejectionReason` aparecerá automáticamente en el tipo cuando el DTO del servidor lo incluya.

---

## Reglas de negocio del modelo

| Regla                                                                                                                   | Fuente         |
| ----------------------------------------------------------------------------------------------------------------------- | -------------- |
| `rejectionReason` es requerido cuando `status === 'rechazado'` — validado con `superRefine` en el controller Zod schema | FR-001, FR-002 |
| `rejectionReason` es inválido si es vacío o solo espacios en blanco                                                     | FR-004         |
| `rejectionReason` máximo 500 caracteres                                                                                 | FR-004         |
| Para `status !== 'rechazado'`, `rejectionReason` debe ser `undefined` — el campo no se persiste                         | FR-005         |
| Registros históricos con `motivo_rechazo = NULL` son válidos; `rejectionReason` será `undefined` en el DTO              | FR-008         |

---

## Estado post-feature: campos de `CertificateDTO`

```typescript
{
  id: number;
  startDate: string;       // ISO date string
  endDate: string;         // ISO date string
  returnDate: string;      // ISO date string
  reason: string;          // Motivo del empleado para la licencia
  type: string;            // Nombre del tipo de certificado
  requiresRest: boolean;
  status: CertificateStatus;
  files?: string[];
  rejectionReason?: string; // NUEVO — presente solo en licencias rechazadas post-feature
}
```
