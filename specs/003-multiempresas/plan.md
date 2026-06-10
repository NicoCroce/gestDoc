# Implementation Plan: Multiempresas

**Branch**: `003-multiempresas` | **Date**: `2026-06-09` | **Spec**: `/specs/003-multiempresas/spec.md`

**Input**: Feature specification from `/specs/003-multiempresas/spec.md`

## Summary

Enable a multi-tenant system where users can belong to multiple companies (`Sis_propietarios`). The authentication flow will detect the number of attached companies. If > 1, the user must select a company on a new intermediate screen; if 1, they log in directly; if 0, access is denied. The frontend will maintain the active context and allow switching companies without a new login.

## Technical Context

**Language/Version**: TypeScript 5.x

**Primary Dependencies**: React 18, React Router v6, tRPC v11, React Hook Form, Zod

**Storage**: MySQL via Sequelize (v6)

**Testing**: Vitest & Playwright

**Target Platform**: B2B Web Application

**Project Type**: Monorepo (Node Server + React SPA)

**Performance Goals**: N/A

**Constraints**: `Empresas` table must NOT be used for info, `Sis_propietarios` must be used. `ownerId` context must propagate securely across UI and requests.

**Scale/Scope**: Impacts Authentication flow, Global State, and Layout UI in the frontend. Impacts Auth / Users domain in the backend.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principio                       | Verificación requerida                                                             | Status |
| ------------------------------- | ---------------------------------------------------------------------------------- | ------ |
| I. Arquitectura Hexagonal / DDD | ¿La feature crea o modifica dominios? ¿Sigue la estructura de 5 capas?             | PASS   |
| II. Multi-Tenant Obligatorio    | ¿Toda query al repositorio filtra por `ownerId`?                                   | PASS   |
| III. TypeScript Estricto + Zod  | ¿Tipos derivados con `z.infer`? ¿Sin `any`? ¿Frontend usa `inferRouterOutputs`?    | PASS   |
| IV. Flujo de Agentes Orquestado | ¿La tarea pasará por analyst → back/front → tester → qa → reviewer?                | PASS   |
| V. Tests por Regla de Negocio   | ¿`@tester` analizará el dominio y generará tests concretos por capa?               | PASS   |
| VI. Conventional Commits        | ¿El `<scope>` del commit coincide con el nombre del dominio afectado?              | PASS   |
| VII. Aislamiento de Dominios    | ¿La feature importa repos de otros dominios? Si sí, ¿usa `cross-domain-relations`? | PASS   |

## Project Structure

### Documentation (this feature)

```text
specs/003-multiempresas/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
packages/server/src/domains/
├── Auth/
│   ├── Application/
│   │   ├── Auth.types.ts
│   │   └── UseCases/LoginUseCase.ts
│   └── Infrastructure/
│       └── trpc/Auth.router.ts
├── Users/
│   └── (optional) usecase for user-empresa reading

packages/app/src/
├── Application/
│   ├── Context/           # State context for active ownerId
│   └── Components/
│       └── Layout/        # Sidebar menu item for company selection
└── Domains/
    └── Auth/
        ├── Screens/
        │   └── SelectCompanyScreen.tsx
        └── Hooks/
```

**Structure Decision**:
Modifying existing `packages/server` and `packages/app` inside the monorepo architecture.
