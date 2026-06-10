# Research & Clarifications: Multiempresas

## Technical Context Unknowns Resolved

### 1. Frontend State Management for Active Tenant

- **Decision**: React Context or `localStorage` to persist the active `ownerId` and React Router for redirect logic.
- **Rationale**: The active `ownerId` needs to be sent on every `RequestContext` or tRPC header. The project uses tRPC with a `requestContext`. In the frontend, TanStack query can invalidate cache when the `ownerId` changes.
- **Alternatives considered**: URL parameter for `ownerId` (creates messy routes in this type of SPA), Zustand (if the project already has it, else React Context is sufficient). Use existing context if possible.

### 2. tRPC Auth Flow Updates

- **Decision**: Modify the `Auth` login use case in the backend. Instead of just returning the token, return the token + `empresas` associated with the user.
- **Rationale**: Based on FR2 and FR5, the frontend needs the list immediately during or post-authentication to take rendering decisions (`length === 0, 1, or > 1`).
- **Alternatives considered**: Separate endpoint `/api/trpc/user/empresas` called immediately after login. Both are valid. Returning it directly in the login response is atomic and prevents race conditions.

### 3. Cross-Domain Communication (Auth / Owners / Users)

- **Decision**: The `Auth` domain will inject a use case from the `Ownersyss` (or similar) domain to fetch the connected `Sis_propietarios` entities via `cross-domain-relations` skill, OR `Users` domain provides a use case `GetUserEmpresasUseCase`.
- **Rationale**: Constitution Principle VII applies. "Ningún dominio importa el repositorio de otro dominio."
- **Alternatives considered**: Direct SQL queries in Auth (rejected; violates DDD).
