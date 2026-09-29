# Data Model: Sin texto de términos no existe pendiente de aceptación

**Feature**: `008-exclude-terms-pending-no-text` | **Fecha**: 2026-09-28

> **Sin cambios de schema.** Ninguna tabla, columna, índice ni migración se crea o modifica. El
> modelo describe las entidades existentes que participan de la regla, la definición derivada
> `hasDisclaimerText` y los DTOs que cambian.

## Entidades existentes (sin cambios de persistencia)

### Empresa / Propietario (Owner)

Registro del tenant. Fuente del texto de términos.

| Atributo           | Tipo                      | Relevancia                                                                                      |
| ------------------ | ------------------------- | ----------------------------------------------------------------------------------------------- |
| `id`               | `bigint` PK               | Identifica la empresa; es el `ownerId` del `RequestContext`                                     |
| `denominacion`     | `string`                  | Nombre de la empresa (usado en emails)                                                          |
| `texto_disclaimer` | `TEXT`, `allowNull: true` | **Atributo decisor de la regla**. Vive en `Sis_propietarios.texto_disclaimer` (`OwnersysModel`) |

- **Acceso**: `OwnersysRepository.getOwnersys({ id, requestContext })` → `Ownersys.entity.values.texto_disclaimer`.
- **No** se expone `texto_disclaimer` en `ICompanyOwner` (`Users.getAllActiveOwners`, que lee
  `CompaniesModel` sin esa columna). La lectura por empresa se mantiene donde ya existe (Disclaimer/Ownersys).

### Usuario (empleado o administrador)

| Atributo                      | Tipo        | Relevancia                                       |
| ----------------------------- | ----------- | ------------------------------------------------ |
| `id`                          | `bigint` PK | Identidad                                        |
| `id_propietario`              | `bigint`    | Tenant (multi-tenant obligatorio)                |
| `nombre`, `apellido`, `email` | `string`    | Datos de contacto/identificación                 |
| `renovar_clave`               | `boolean`   | Otro pendiente, **no** afectado por esta feature |

### Registro de aceptación de términos (DisclaimerAcceptance)

| Atributo                                       | Tipo     | Relevancia                     |
| ---------------------------------------------- | -------- | ------------------------------ |
| `id_usuario`                                   | `bigint` | Usuario que aceptó             |
| `id_empresa`                                   | `bigint` | Empresa (tenant)               |
| `hash_prueba`, `timestamp`, `ip`, `user_agent` | varios   | Validez/corrupción de la firma |

- Su **ausencia o invalidez** solo se interpreta como "pendiente" cuando `hasDisclaimerText === true`.
- Sin cambios de modelo ni de las queries existentes (`getEmployeesByCompany`,
  `getEmployeesWithoutDisclaimerAcceptance`, `countPendingDisclaimers`, `getPendingEmployeeIds`).

## Valor derivado (no persistido)

### `hasDisclaimerText(empresa) → boolean`

Definición única (helper compartido):

```ts
hasDisclaimerText(text?: string | null): boolean  // Boolean(text?.trim())
```

| Entrada `texto_disclaimer`                   | `hasDisclaimerText` | Existe pendiente de términos |
| -------------------------------------------- | ------------------- | ---------------------------- |
| `null` / `undefined`                         | `false`             | No                           |
| `''`                                         | `false`             | No                           |
| `"   \t\n "` (solo blancos)                  | `false`             | No                           |
| `"Términos..."` (al menos un char no blanco) | `true`              | Sí (para quien no aceptó)    |

- **Validación**: trim sobre el string; cualquier carácter no-blanco ⇒ `true`.
- **Multi-tenant**: el valor se calcula con el `ownerId` del `RequestContext` de la empresa en curso,
  nunca con un id provisto por el cliente (la procedure `hasText` no recibe input).

## DTOs afectados

### Backend

| DTO                                                      | Cambio                                                                                    | Consumidor                                                         |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `IGeneric` → `disclaimer.hasText` output                 | **Nuevo**: `boolean`                                                                      | Frontend Admin                                                     |
| `IEmployeeReminder.pending.pendingDisclaimerAcceptance`  | Semántica: ahora `hasDisclaimerText && estado_firma !== 'Firmado'` (mismo tipo `boolean`) | `employeeDailyReminder.template.ts`, `EmployeeReminder.shouldSend` |
| `PendingDisclaimerAcceptancesSection` (reporte)          | Sin cambio de tipo; pasa a `{ items: [], totalCount: 0 }` cuando no hay texto             | `dailyReport.template.ts` (se omite por flag)                      |
| `StatisticalSummarySection.pendingDisclaimerAcceptances` | Sin cambio de tipo; pasa a `0` cuando no hay texto                                        | `dailyReport.template.ts` (fila omitida por flag)                  |
| `IDailyReport`                                           | **Nuevo campo** `hasDisclaimerText: boolean`                                              | `dailyReport.template.ts`                                          |

`IDailyReport` queda:

```ts
export interface IDailyReport {
  ownerId: number;
  companyName: string;
  date: string; // ISO 8601 (YYYY-MM-DD)
  hasDisclaimerText: boolean; // NUEVO — gobierna la omisión en el template
  sections: IDailyReportSections;
}
```

Se espeja en:

- `DailyReport/Domain/DailyReport.types.ts` (fuente)
- `DailyReport/Domain/DailyReport.entity.ts` (`create` / `values`)
- `Infrastructure/utils/Email/Templates/types.ts` (`IDailyReport` estructural del template)
- `GenerateDailyReport.usecase.ts` (lo puebla) y `GenerateDailyReportStub.usecase.ts` (stub: `true`)
- fixtures/specs de `DailyReport`

### Frontend (derivados del router, sin tipos manuales)

| Artefacto                          | Tipo                          | Origen                                              |
| ---------------------------------- | ----------------------------- | --------------------------------------------------- |
| `disclaimer.hasText`               | `boolean`                     | `inferRouterOutputs<TDisclaimerRouter>` (implícito) |
| Visibilidad de columna/bloque/card | `boolean` propagado por props | `useHasDisclaimerText` → `useEmpleadosPage`         |

> No se introducen interfaces manuales con prefijo `I` en el frontend (Principio III). La
> preselección y la visibilidad se derivan de la bandera; `IEmployeeRecord.estado_firma` no cambia.

## Transiciones de estado

No aplica: la feature no modela una máquina de estados. Es una regla de visibilidad/conteo evaluada
en el momento de generar cada correo, reporte o vista (spec Assumptions: no hay evaluación contra
valor histórico).

## Reglas de integridad / validación

- **FR-001**: `hasDisclaimerText` es `false` si y solo si `Boolean(texto_disclaimer?.trim())` es `false`.
- **FR-008**: el valor se decide por empresa; una empresa no altera el resultado de otra en la misma corrida.
- **FR-009**: la exclusión no depende de la existencia/validez del registro de aceptación.
- **FR-010**: ningún otro pendiente, sección, conteo o destinatario se altera.
