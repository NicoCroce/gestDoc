# Quickstart Validation Guide: Multiempresas

This guide defines how to validate the multi-empresa login flow end-to-end.

## Prerequisites

1. Backend running (`pnpm --filter server run dev`)
2. Frontend running (`pnpm --filter app run dev`)
3. Database seeded with proper users.

## Scenarios

### Scenario 1: Zero Empresas

**Setup Data**:

- Create a test user `no_empresa@test.com`.
- Do not assign them any records in `Empresas_usuarios`.
  **Action**:
- Run E2E or manual test: Login with `no_empresa@test.com`.
  **Expected Outcome**:
- User sees "Access Denied / Contact Admin" screen.
- Redirection to dashboard is blocked.

### Scenario 2: Single Empresa

**Setup Data**:

- Create a test user `one_empresa@test.com`.
- Assign exactly one record in `Empresas_usuarios` pointing to a valid `Sis_propietarios.id` (e.g., ID 1).
  **Action**:
- Login.
  **Expected Outcome**:
- Automatic injection of `ownerId=1` in context.
- Skips selection screen.
- User lands directly in the Dashboard with data from Empresa 1.

### Scenario 3: Multiple Empresas

**Setup Data**:

- Create user `multi_empresa@test.com`.
- Assign them to `Sis_propietarios.id = 1` and `Sis_propietarios.id = 2` via `Empresas_usuarios`.
  **Action**:
- Login.
  **Expected Outcome**:
- Redirection to `<SelectCompanyScreen>`.
- Screen lists 2 buttons showing names and logos.
- Click on Empresa 2.
- Dashboard renders with `ownerId=2` context.
- Sidebar menu shows an item to navigate back to company selection.
