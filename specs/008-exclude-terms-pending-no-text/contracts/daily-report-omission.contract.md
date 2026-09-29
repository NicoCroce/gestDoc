# Contract: Omisión de términos en recordatorios y reporte

**Feature**: `008-exclude-terms-pending-no-text`
**Tipo**: Contrato interno de backend (comportamiento de los flujos existentes).
**Entrada común**: `hasDisclaimerText` a nivel empresa (ver `company-terms-flag.contract.md`).

## 1. Recordatorio diario de empleados (`EmployeeReminders`)

**Archivo**: `EmployeeReminders/Application/UseCases/GenerateDailyReminder.usecase.ts`

**Cambio**: inyectar `HasDisclaimerText` (cross-domain, clave `_hasDisclaimerText`) y computar el
flag **una vez por empresa**:

```ts
const hasTerms = await executeUseCase({
  useCase: this._hasDisclaimerText,
  requestContext, // ownerContext de la empresa en curso
});

// ...
pending: {
  unsignedDocuments,
  unviewedDocuments,
  pendingDisclaimerAcceptance: hasTerms && employee.estado_firma !== 'Firmado',
  renewPassword: employee.renovar_clave,
}
```

**Efecto derivado**: `EmployeeReminder.shouldSend` ya considera
`pendingDisclaimerAcceptance`; con `false`, un empleado cuyo único pendiente era términos deja de
tener pendientes ⇒ `SendEmployeeReminderEmail` omite el envío (`shouldSend === false`).

### Escenarios

1. **Given** empresa sin texto y empleado con documentos sin firmar (sin aceptación de términos),
   **When** se genera su recordatorio, **Then** el email incluye solo documentos y **no** la sección
   "Términos y condiciones sin aceptar".
2. **Given** empresa sin texto y empleado cuyo único pendiente era términos, **When** se genera su
   recordatorio, **Then** `shouldSend === false` y **no** se envía correo.
3. **Given** empresa sin texto y empleado que nunca registró aceptación, **When** se genera su
   recordatorio, **Then** `pendingDisclaimerAcceptance === false` (independiente del registro).
4. **Given** empresa **con** texto y empleado `estado_firma = 'Pendiente'`, **When** se genera su
   recordatorio, **Then** `pendingDisclaimerAcceptance === true` y la sección se incluye (sin cambio).
5. **Given** una corrida con empresas con y sin texto, **When** se procesan, **Then** cada una se
   decide por su propio `ownerContext` (aislamiento multi-tenant).

## 2. Reporte diario a administradores (`DailyReport`)

**Archivos**:

- `DailyReport/Application/UseCases/GenerateDailyReport.usecase.ts`
- `DailyReport/Domain/DailyReport.types.ts`, `DailyReport.entity.ts`
- `Infrastructure/utils/Email/Templates/types.ts`, `dailyReport.template.ts`
- `Disclaimer/Application/UseCases/GetPendingDisclaimerAcceptances.usecase.ts`,
  `CountPendingDisclaimers.usecase.ts`

### 2a. Datos

- `GetPendingDisclaimerAcceptances.getPendingDisclaimerAcceptances` devuelve `[]` cuando la empresa
  no tiene texto (auto-gate con `HasDisclaimerText`).
- `CountPendingDisclaimers` devuelve `0` cuando la empresa no tiene texto (auto-gate con
  `HasDisclaimerText`). Esto propaga el `0` a `StatisticalSummarySection.pendingDisclaimerAcceptances`
  sin tocar `GetStatisticalSummary`.
- `GenerateDailyReport` inyecta `HasDisclaimerText` y puebla `report.hasDisclaimerText`.

### 2b. Presentación (template)

`dailyReport.template.ts` omite **por completo**, si `hasDisclaimerText === false`:

1. La fila del resumen: `Términos sin aceptar` (dentro de la tabla de `Resumen`).
2. La sección detallada: `renderSection('Términos y condiciones sin aceptar (...)', ...)`.

No se renderiza "Términos ... (0)" ni "No existen coincidencias en este período" para términos.

### Escenarios

1. **Given** empresa sin texto, **When** se genera el reporte, **Then** `hasDisclaimerText === false`,
   `sections.pendingDisclaimerAcceptances = { items: [], totalCount: 0 }`,
   `statisticalSummary.pendingDisclaimerAcceptances === 0`, y el HTML **no** contiene ninguna cadena
   "Términos" (ni fila ni sección).
2. **Given** empresa sin texto y usuarios sin aceptación registrada, **When** se genera el reporte,
   **Then** esos usuarios no aparecen en el detalle ni se cuentan.
3. **Given** empresa **con** texto, **When** se genera el reporte, **Then** `hasDisclaimerText === true`
   y el HTML refleja el comportamiento actual (fila + sección con conteo real).
4. **Given** el stub `GenerateDailyReportStub`, **When** se genera, **Then** incluye
   `hasDisclaimerText: true` (comportamiento actual de render).

## 3. Recordatorio manual de disclaimer (`Disclaimer`)

**Archivo**: `Disclaimer/Application/UseCases/SendReminders.usecase.ts` (el **precedente** del guard).

**Cambio**:

```ts
// antes:  if (!disclaimerText) return { sent: 0, failed: 0, total: 0 };
if (!hasDisclaimerText(disclaimerText)) return { sent: 0, failed: 0, total: 0 };
```

### Escenarios

1. **Given** empresa con `texto_disclaimer` null/vacío/solo blancos, **When** un admin dispara el
   recordatorio manual, **Then** no se envía ningún correo (`sent: 0`).
2. **Given** empresa con texto real, **When** se dispara, **Then** el comportamiento es el actual.

## 4. Vistas de administración (frontend `Admin`)

**Archivos**: `Admin/Hooks/useEmpleadosPage.ts`, `useGetStatisticsEmpleados.ts`,
`useHasDisclaimerText.ts`, `Admin/Components/EmpleadosColumns.tsx`, `EmployeeCards.tsx`,
`StatisticsEmpleados.tsx`, `Admin/Pages/Empleados.page.tsx`.

### Contrato de visibilidad (derivado de la única bandera)

| Superficie                                             | `hasDisclaimerText === false`                                                   | `hasDisclaimerText === true`                          |
| ------------------------------------------------------ | ------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Columna `estado_firma` ("Términos firmados")           | No se incluye en `employeeColumns`                                              | Se incluye (actual)                                   |
| Bloque "Términos firmados" en `EmployeeCards`          | No se renderiza                                                                 | Se renderiza (actual)                                 |
| Card "Aceptación de términos" en `StatisticsEmpleados` | No se renderiza; `dataChartEstadoFirma` no se computa; grilla `md:grid-cols-2`  | Se renderiza; grilla `md:grid-cols-3` (actual)        |
| Preselección en `handleActivateSelection`              | No preselecciona por términos (`selectedIds` vacío al entrar en modo selección) | Preselecciona `estado_firma === 'Pendiente'` (actual) |

### Escenarios

1. **Given** empresa sin texto y empleados sin aceptación, **When** un admin abre la gestión de
   empleados, **Then** la tabla no muestra la columna de términos y las tarjetas no muestran el bloque.
2. **Given** empresa sin texto, **When** el admin mira las estadísticas, **Then** no aparece la card
   "Aceptación de términos" y la grilla tiene dos columnas en desktop.
3. **Given** empresa sin texto, **When** el admin activa "Enviar recordatorios", **Then** no se
   preselecciona a nadie por términos.
4. **Given** empresa **con** texto, **When** el admin abre la página, **Then** columna, bloque, card,
   grilla y preselección se comportan exactamente como hoy (SC-004).
5. **Given** que la bandera aún carga, **When** se renderiza la página, **Then** se usa el estado de
   carga de la página (la bandera forma parte del gate) para no mostrar/ocultar columnas con reflow.

## 5. Anti-requisitos transversales

- No crear copy nueva, estado "No aplica", badge neutro ni empty state para términos.
- No alterar otros pendientes, secciones, conteos ni destinatarios (FR-010).
- No modificar el modelo de datos ni las queries de aceptación existentes.
- No dejar placeholders vacíos en la tabla/grilla (regla 3 de `frontend-design.md`).
