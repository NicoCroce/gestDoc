# Contract: Bandera de términos a nivel empresa (`hasDisclaimerText`)

**Feature**: `008-exclude-terms-pending-no-text`
**Tipo**: Contrato tRPC (backend↔frontend) + contrato interno de backend (DI).
**Fuente de verdad**: `Disclaimer` (dominio dueño del concepto "términos"), alimentado por
`Sis_propietarios.texto_disclaimer` vía `OwnersysRepository`.

## 1. Superficie tRPC (frontend)

### `disclaimer.hasText`

| Campo        | Valor                                                                             |
| ------------ | --------------------------------------------------------------------------------- |
| Tipo         | `query`                                                                           |
| Input        | **ninguno** (la empresa se resuelve desde `RequestContext.values.ownerId`)        |
| Output       | `boolean`                                                                         |
| Seguridad    | `protectedProcedure`                                                              |
| Multi-tenant | `ownerId` exclusivamente desde `RequestContext`; nunca del cliente (Principio II) |

**Semántica**: devuelve `true` si y solo si la empresa del usuario autenticado tiene texto de
términos con al menos un carácter no-blanco (`Boolean(texto_disclaimer?.trim())`). `false` para
`null`, `''` o solo espacios/tabs/saltos.

**Errores**: si la empresa no existe en `Sis_propietarios`, `GetDisclaimerText` devuelve `''` ⇒ la
procedure responde `false` (no lanza). El error de negocio no es parte de este contrato.

**Ejemplo (frontend)**:

```ts
// Admin usa el router `disclaimer` ya instanciado en Admin.service.ts
const { data: hasDisclaimerText = false, isLoading } =
  AdminDisclaimerService.hasText.useQuery();
```

> **Nota de consumo**: la bandera se consulta **una vez** en la página de empleados
> (`useHasDisclaimerText` dentro de `useEmpleadosPage`) y se propaga por props a columnas, tarjetas
> y estadísticas. Ningún componente recalcula la condición (regla 2 de `frontend-design.md`).

## 2. Contrato interno de backend

### Use case `HasDisclaimerText`

```ts
// Disclaimer/Application/UseCases/HasDisclaimerText.usecase.ts
export class HasDisclaimerText implements IUseCase<boolean> {
  constructor(private readonly _getDisclaimerText: GetDisclaimerText) {}

  async execute({ requestContext }: IRequestContext): Promise<boolean> {
    const text = await executeUseCase({
      useCase: this._getDisclaimerText,
      input: requestContext.values.ownerId,
      requestContext,
    });
    return hasDisclaimerText(text);
  }
}
```

- **Registro Awilix**: `_hasDisclaimerText: asClass(HasDisclaimerText)` en `disclaimer.di.ts`
  (clave exacta; el parámetro del constructor de los consumidores debe llamarse `_hasDisclaimerText`).
- **Cross-domain**: consumido por `EmployeeReminders` y `DailyReport` como **caso de uso** vía DI
  (Principio VII). No se importa `DisclaimerRepository` ni `OwnersysRepository` en esos dominios.
- **Fuente**: `GetDisclaimerText` (mismo dominio) → `OwnersysRepository.getOwnersys` → `texto_disclaimer`.

### Helper compartido

```ts
// Infrastructure/utils/disclaimerUtils.ts
export const hasDisclaimerText = (text?: string | null): boolean =>
  Boolean(text?.trim());
```

Exportado desde `@server/Infrastructure`. Es la **única** definición de "sin texto" usada por
`Login` (existente), `HasDisclaimerText`, `SendReminders`, `GenerateDailyReminder` y
`GenerateDailyReport`.

## 3. Escenarios (Given/When/Then)

### Bandera

1. **Given** una empresa con `texto_disclaimer = null`, **When** se consulta `disclaimer.hasText`,
   **Then** responde `false`.
2. **Given** una empresa con `texto_disclaimer = ''`, **When** se consulta `disclaimer.hasText`,
   **Then** responde `false`.
3. **Given** una empresa con `texto_disclaimer = "   \t\n "`, **When** se consulta
   `disclaimer.hasText`, **Then** responde `false`.
4. **Given** una empresa con `texto_disclaimer = "Acepto los términos"`, **When** se consulta
   `disclaimer.hasText`, **Then** responde `true`.
5. **Given** el `RequestContext` de la empresa A (sin texto), **When** la procedure se ejecuta,
   **Then** el resultado depende solo del `ownerId` del contexto, nunca de un input del cliente.

### Consumidores backend de la bandera

6. **Given** una empresa sin texto, **When** `GenerateDailyReminder` arma el pendiente de un empleado
   con `estado_firma = 'Pendiente'`, **Then** `pending.pendingDisclaimerAcceptance = false`.
7. **Given** una empresa con texto, **When** `GenerateDailyReminder` arma el pendiente de un empleado
   con `estado_firma = 'Pendiente'`, **Then** `pending.pendingDisclaimerAcceptance = true` (sin cambio).
8. **Given** una empresa sin texto, **When** se ejecuta `GenerateDailyReport`, **Then** el reporte
   tiene `hasDisclaimerText = false` (ver `daily-report-omission.contract.md`).

## 4. Anti-requisitos (qué NO debe pasar)

- No agregar el flag al response de `getEmployees` (`IPaginationResponse` es compartido y genérico).
- No derivar la bandera en el frontend a partir de `getText` (el backend es dueño de la regla).
- No agregar `ownerId` como input de la procedure.
- No introducir un tipo manual `I...` en el frontend para la bandera.
