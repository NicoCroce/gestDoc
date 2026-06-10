---
description: 'Task list template for feature implementation'
---

# Tasks: Multiempresas

**Input**: Design documents from `/specs/003-multiempresas/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Verify project structure per implementation plan matches `packages/server` and `packages/app`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core logic and structures that ALL multi-empresa stories depend on (Data changes, Backend Auth, and Global App State).

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T002 Define Zod schema for `EmpresaAsignada` and update the `LoginResponse` and `MeResponse` in `packages/server/src/domains/Auth/Application/Auth.types.ts`
- [ ] T003 Implement `GetUserCompaniesUseCase` in `packages/server/src/domains/Users/Application/UseCases/GetUserCompaniesUseCase.ts` (retrieves `Sis_propietarios` based on `id_usuario` from `Empresas_usuarios`)
- [ ] T004 Update `LoginUseCase` to fetch user companies and embed them into the return value alongside the token in `packages/server/src/domains/Auth/Application/UseCases/LoginUseCase.ts`
- [ ] T005 Update `auth.login` and `auth.me` TRPC endpoints in `packages/server/src/domains/Auth/Infrastructure/trpc/Auth.router.ts` to return the new output schema
- [ ] T006 [P] Update or create `OwnerContext` to store globally the active `ownerId` and companies list in `packages/app/src/Application/Context/OwnerContext.tsx`
- [ ] T007 [P] Create React hook for updating and retrieving the auth session and companies list efficiently, updating `packages/app/src/Domains/Auth/Hooks/useLogin.ts` (or creating `useAuth`)

**Checkpoint**: Backend `auth.login` returns the token plus a list of companies. Frontend context is capable of storing active `ownerId`.

---

## Phase 3: User Story 3 - Inicio de sesión sin empresas asignadas (Priority: P1) 🎯 MVP

**Goal**: Block users with 0 associated companies from logging in and show an error message advising them to contact an admin.

**Independent Test**: Scenario 1 from `quickstart.md`. User logs in, has no Empresas, sees error immediately, no `ownerId` set. (Frontend intercepts login response or backend throws error, depending on strategy).

### Implementation for User Story 3

- [ ] T008 [US3] Add validation logic upon receiving the login response to reject login if `empresas.length === 0` in `packages/app/src/Domains/Auth/Hooks/useLogin.ts` (showing an error/alert to contact admin).

**Checkpoint**: At this point, User Story 3 should be fully functional independently.

---

## Phase 4: User Story 1 - Inicio de sesión con una sola empresa asignada (Priority: P2)

**Goal**: Users with exactly 1 associated company log in directly bypassing the selection screen.

**Independent Test**: Scenario 2 from `quickstart.md`. User logs in, has 1 Empresa, goes directly to dashboard with `ownerId` set in context.

### Implementation for User Story 1

- [ ] T009 [US1] Add logic upon receiving the login response to auto-select company and redirect directly to dashboard if `empresas.length === 1` in `packages/app/src/Domains/Auth/Hooks/useLogin.ts`.
- [ ] T010 [US1] Set `ownerId` in the `OwnerContext` with that single company's ID.

**Checkpoint**: At this point, User Stories 3 AND 1 should both work independently.

---

## Phase 5: User Story 2 - Inicio de sesión con múltiples empresas asignadas (Priority: P3)

**Goal**: Users with > 1 associated companies must log in, hold dashboard access, select a company, and then continue.

**Independent Test**: Scenario 3 from `quickstart.md`. User logs in, redirected to select-company UI, selects company, lands in dashboard with correct context.

### Implementation for User Story 2

- [ ] T011 [P] [US2] Update React Router configuration to include the `/select-company` route in `packages/app/src/Infrastructure/Routes.tsx`.
- [ ] T012 [P] [US2] Create `<SelectCompanyScreen>` UI component presenting available companies visually in `packages/app/src/Domains/Auth/Screens/SelectCompanyScreen.tsx`.
- [ ] T013 [US2] Add logic upon receiving the login response to set state = AWAITING_SELECTION or redirect to `/select-company` when `empresas.length > 1` in `packages/app/src/Domains/Auth/Hooks/useLogin.ts`.
- [ ] T014 [US2] Tie the `<SelectCompanyScreen>` clicks to setting the active `ownerId` in `OwnerContext` and navigating to the dashboard.

**Checkpoint**: All login flow user stories should now be functional.

---

## Phase 6: User Story 4 - Cambio de empresa intra-navegación (Priority: P4)

**Goal**: Currently logged-in active users can return to the company selection screen via a sidebar menu item without needing a full re-login.

**Independent Test**: User is in the Dashboard, sees the Company Selection menu item in the sidebar, clicks it, is redirected back to the selection screen, selects a different company, `ownerId` updates, and data refetches.

### Implementation for User Story 4

- [ ] T015 [P] [US4] Add a new sidebar menu item "Cambiar Empresa" in `packages/app/src/Application/Components/Layout/Sidebar.tsx` (or equivalent layout navigation) that triggers navigation to `/select-company`.
- [ ] T016 [US4] Ensure that navigating back to `/select-company` properly resets or updates the active `ownerId` in Context when a new company is selected, invalidating TanStack query caches upon change.

**Checkpoint**: Users can swap tenant context manually inside the app.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T017 [P] Code cleanup and typing reviews inside the Auth/Users backend domain updates.
- [ ] T018 Run Quickstart validation scenarios 1, 2, and 3 fully as defined in `specs/003-multiempresas/quickstart.md`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion. They are implemented sequentially from easiest to hardest to guarantee login flow stability.
- **Polish (Final Phase)**: Depends on completion of all stories.

### Parallel Execution Examples

- While T002-T004 (backend auth) are happening, T006 and T011-T012 and T015 (frontend UI shells and context) can be done in parallel safely.
