# Implementation Plan: Sin texto de términos no existe pendiente de aceptación

**Branch**: `008-exclude-terms-pending-no-text` | **Date**: 2026-09-28 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/008-exclude-terms-pending-no-text/spec.md`

**UI Brief**: [`frontend-design.md`](./frontend-design.md) — cambio sustractivo (ocultar, no reemplazar; una sola bandera a nivel empresa; sin copy ni componentes nuevos).

## Summary

Aplicar de forma uniforme la regla de negocio **"si la empresa no tiene texto de términos, no existe el pendiente de aceptación de términos"** en los cuatro canales/superficies que hoy lo señalizan: recordatorio diario de empleados, reporte diario a administradores, recordatorio manual de disclaimer y vistas de administración (tabla/tarjetas + estadísticas de "Estado de firma").

La regla canónica ya existe en el sistema: `Auth/Login.usecase.ts` calcula `Boolean(texto_disclaimer?.trim())` para no pedir aceptación cuando la empresa no tiene texto. Esta feature **extrae esa definición a un helper compartido** (`hasDisclaimerText`), la aplica en los flujos que hoy usan el guard débil `if (!texto)`, y **expone una bandera booleana a nivel empresa** (`disclaimer.hasText`) para que el frontend derive la visibilidad de columna/tarjeta/estadística desde una única fuente, sin repetir chequeos por componente.

Enfoque técnico:

1. **Helper compartido** `hasDisclaimerText(text?: string | null): boolean` en `Infrastructure/utils/` — definición única de "sin texto" (null, `''`, o solo espacios/tabs/saltos).
2. **Disclaimer** es el dueño de la bandera: nuevo use case `HasDisclaimerText` (owner-scoped desde `RequestContext`) que reutiliza `GetDisclaimerText`; nueva procedure tRPC `disclaimer.hasText` → `boolean`.
3. **EmployeeReminders**: `GenerateDailyReminder` inyecta `HasDisclaimerText` (cross-domain por caso de uso) y computa el pendiente de términos como `hasText && estado_firma !== 'Firmado'`.
4. **DailyReport**: `GetPendingDisclaimerAcceptances` y `CountPendingDisclaimers` se auto-gatean (`[]`/`0` sin texto); `GenerateDailyReport` agrega `hasDisclaimerText` al reporte y el template de email **omite por completo** la fila del resumen y la sección detallada.
5. **Disclaimer manual**: `SendReminders` cambia `if (!disclaimerText)` por `if (!hasDisclaimerText(disclaimerText))` (alineado a `.trim()`).
6. **Frontend Admin**: un único hook (`useHasDisclaimerText`) obtiene la bandera; `useEmpleadosPage` la propaga a columnas, tarjetas, estadísticas y preselección.

No se modifica el modelo de datos (la columna `Sis_propietarios.texto_disclaimer` ya existe), no se crean dominios ni componentes nuevos, y no hay copy nueva.

## Technical Context

**Language/Version**: TypeScript 6.x estricto (Node.js), monorepo pnpm workspaces

**Primary Dependencies**: Express 5, tRPC v11, Sequelize v6 (MySQL), Awilix 13 (DI, `InjectionMode.CLASSIC` + `strict`), Zod 4, Pino 10; Frontend: React 19, Vite 8, TanStack Query v5, React Router v7, Tailwind CSS v4

**Storage**: MySQL vía Sequelize — **sin cambios de schema**. El texto vive en `Sis_propietarios.texto_disclaimer` (`TEXT`, `allowNull: true`), leído por `OwnersysRepository.getOwnersys`

**Testing**: Vitest 2 — tests por regla de negocio en `Application/UseCases/specs/` y `Domain/specs/` (Principio V); tests de hooks/componentes en `packages/app` donde aplique. Datos concretos, sin stubs ni `it.todo`

**Target Platform**: Node.js backend (`packages/server`) + SPA (`packages/app`)

**Project Type**: Modular Monolith existente — cambio transversal en 3 dominios de negocio + 1 fuente de verdad reutilizada (`Ownersys`, solo lectura) + dominio `Admin` del frontend

**Performance Goals**: N/A — no hay requisito nuevo. La bandera se computa **una vez por empresa** por corrida (EmployeeReminders: 1 lectura por owner; DailyReport: hasta 3 lecturas de la misma fila por owner vía los 3 use cases que la consumen). Sin N+1 por empleado

**Constraints**: No tocar el schema ni `Entity`/repositorios de persistencia; multi-tenant estricto por `RequestContext.values.ownerId`; cero regresión para empresas **con** texto (SC-004); la UI no agrega copy ni estado "No aplica" (`frontend-design.md` regla 1); el reporte de email omite por completo, no muestra ceros

**Scale/Scope**: 3 dominios backend (`Disclaimer`, `EmployeeReminders`, `DailyReport`) + `Ownersys` (lectura) + 1 helper compartido + dominio frontend `Admin` (1 hook, 3 componentes, 1 página, 1 hook de estadísticas)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principio                       | Verificación requerida                                                                    | Resultado                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I. Arquitectura Hexagonal / DDD | ¿La feature crea o modifica dominios? ¿Sigue la estructura de 5 capas?                    | No crea dominios. Cambios en `Application/` y `Domain/` (DTOs) de dominios existentes + 1 helper en `Infrastructure/utils/` + 1 procedure en `Infrastructure/Controllers/Routes` del dominio `Disclaimer`. Frontend en `Domains/Admin/{Hooks,Components,Pages}`. Estructura de capas respetada. **PASS**                                                                                                        |
| II. Multi-Tenant Obligatorio    | ¿Toda query al repositorio filtra por `ownerId`?                                          | La bandera se resuelve por `RequestContext.values.ownerId` (nunca del cliente; la procedure `hasText` no recibe input). Las corridas diarias ya construyen un `RequestContext` sintético por owner. No se agregan queries nuevas ni filtros manuales. **PASS**                                                                                                                                                  |
| III. TypeScript Estricto + Zod  | ¿Tipos derivados con `z.infer`? ¿Sin `any`? ¿Frontend usa `inferRouterOutputs`?           | `hasText` es un output primitivo (`boolean`), sin schema de input. El frontend consume el `boolean` del router (no define tipos manuales). `IDailyReport` gana un campo `boolean`. Sin `any`. **PASS**                                                                                                                                                                                                          |
| IV. Flujo de Agentes Orquestado | ¿La tarea pasa por analyst (o Speckit) → implement → back/front → tester → qa → reviewer? | Origen Speckit (`spec.md` → `plan.md` → `tasks.md`). Scope mixto: `@blendverse-back` (Disclaimer/EmployeeReminders/DailyReport + helper) y `@blendverse-front` (Admin), luego `@blendverse-tester ∥ @blendverse-reviewer` → `qa-report.sh`. **PASS**                                                                                                                                                            |
| V. Tests por Regla de Negocio   | ¿`@blendverse-tester` analizará el dominio y generará tests concretos por capa?           | Sí: tests de negocio por capa (helper, use cases, template de email, hook/componentes) con casos borde (null, `''`, espacios) y multi-tenant; ver `contracts/` y `quickstart.md`. **PASS**                                                                                                                                                                                                                      |
| VI. Conventional Commits        | ¿El `<scope>` del commit coincide con el nombre del dominio afectado?                     | Work units por dominio: `feat(disclaimer)`, `fix(employee-reminders)`, `fix(daily-report)`, `feat(admin)`; el helper transversal puede ir en el commit de `disclaimer` (su dueño funcional). **PASS**                                                                                                                                                                                                           |
| VII. Aislamiento de Dominios    | ¿La feature importa repos de otros dominios? Si sí, ¿usa `cross-domain-relations`?        | No se agregan imports de repositorios cross-domain. `EmployeeReminders` y `DailyReport` inyectan el **caso de uso** `HasDisclaimerText` de Disclaimer vía DI. El nuevo `HasDisclaimerText` reutiliza el use case `GetDisclaimerText` del **mismo** dominio (no importa `OwnersysRepository`); los usos preexistentes de `OwnersysRepository` en `GetDisclaimerText`/`SendReminders` quedan como están. **PASS** |

No hay violaciones — no se requiere `Complexity Tracking`.

## Project Structure

### Documentation (this feature)

```text
specs/008-exclude-terms-pending-no-text/
├── plan.md              # Este archivo
├── research.md          # Fase 0 — decisión de la fuente de verdad, regla canónica y alternativas
├── data-model.md         # Fase 1 — entidades (sin cambios de schema) y DTOs afectados
├── contracts/
│   ├── company-terms-flag.contract.md    # Contrato tRPC + interno de la bandera por empresa
│   └── daily-report-omission.contract.md # Contrato de omisión del reporte y del recordatorio
├── quickstart.md        # Fase 1 — validación end-to-end por las 4 superficies
└── tasks.md             # Fase 2 (/speckit.tasks — no generado por este comando)
```

### Source Code (repository root)

Sin dominios nuevos. Archivos existentes a crear/modificar:

```text
packages/server/src/
├── Infrastructure/
│   ├── index.ts                                  # + export del helper
│   └── utils/
│       └── disclaimerUtils.ts                    # NUEVO: hasDisclaimerText(text?)
├── domains/
│   ├── Disclaimer/
│   │   ├── Application/
│   │   │   ├── UseCases/
│   │   │   │   ├── HasDisclaimerText.usecase.ts  # NUEVO: IUseCase<boolean>, owner-scoped
│   │   │   │   ├── GetPendingDisclaimerAcceptances.usecase.ts  # auto-gate: [] sin texto
│   │   │   │   ├── CountPendingDisclaimers.usecase.ts          # auto-gate: 0 sin texto
│   │   │   │   └── SendReminders.usecase.ts                    # guard -> hasDisclaimerText
│   │   │   ├── Disclaimer.service.ts             # + hasDisclaimerText()
│   │   │   └── UseCases/index.ts                 # + export del nuevo use case
│   │   ├── Infrastructure/Controllers/Disclaimer.controller.ts # + procedure hasText
│   │   ├── Infrastructure/Routes/Disclaimer.routes.ts           # + hasText
│   │   └── disclaimer.di.ts                      # + _hasDisclaimerText
│   ├── EmployeeReminders/
│   │   └── Application/UseCases/GenerateDailyReminder.usecase.ts # + HasDisclaimerText (DI)
│   └── DailyReport/
│       ├── Application/UseCases/GenerateDailyReport.usecase.ts  # + HasDisclaimerText (DI)
│       ├── Application/UseCases/GenerateDailyReportStub.usecase.ts # + hasDisclaimerText: true
│       └── Domain/DailyReport.types.ts                          # IDailyReport + hasDisclaimerText
│       └── Domain/DailyReport.entity.ts                         # create/values + hasDisclaimerText
│   └── Infrastructure/utils/Email/Templates/
│       ├── types.ts                              # IDailyReport + hasDisclaimerText
│       └── dailyReport.template.ts               # omisión condicional (fila + sección)

packages/app/src/Domains/Admin/
├── Hooks/
│   ├── useHasDisclaimerText.ts                   # NUEVO: adminDisclaimerService.hasText.useQuery
│   ├── useEmpleadosPage.ts                       # propaga hasDisclaimerText + gate de preselección
│   ├── useGetStatisticsEmpleados.ts              # recibe hasDisclaimerText, omite dataChartEstadoFirma
│   └── index.ts                                  # + export del nuevo hook
├── Components/
│   ├── EmpleadosColumns.tsx                      # columna estado_firma condicional
│   ├── EmployeeCards.tsx                         # bloque "Términos firmados" condicional
│   └── StatisticsEmpleados.tsx                   # card "Aceptación de términos" condicional + grilla
└── Pages/Empleados.page.tsx                      # pasa hasDisclaimerText a hijos

packages/server/src/domains/[Disclaimer|EmployeeReminders|DailyReport]/**/specs/*.spec.ts  # tests
packages/app/src/Domains/Admin/**/specs/*.spec.ts(x)                                        # tests
```

**Structure Decision**: monorepo existente con dominios establecidos; no aplica ninguna opción de
estructura del template (single/web/mobile). La corrección se distribuye en `Application/` de tres
dominios backend, un helper transversal en `Infrastructure/utils/`, el template de email del reporte,
y el dominio `Admin` del frontend. La bandera de empresa se resuelve en `Disclaimer` (dueño del
concepto de términos) y se expone al front por el router `disclaimer`, que `Admin` ya consume.

## Complexity Tracking

> Sin violaciones de Constitution Check — tabla no aplica.
