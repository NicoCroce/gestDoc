# Data Model: Multiempresas

## Entities & Relationships

### `Sis_propietarios` (Existing)

- **Role**: Contains the actual tenant data.
- **Fields used**: `id`, `nombre`, `logo` (or `imagen`), `estado` / `activo`.

### `Usuarios` / `Sec_usuarios` (Existing)

- **Role**: Contains the authenticated user.
- **Fields used**: `id`, credentials, `rol`.

### `Empresas_usuarios` (New / Modifying)

- **Role**: Associative table (N:N) binding users to tenants.
- **Fields**:
  - `id`: PK
  - `id_usuario`: FK to `Usuarios.id`
  - `id_empresa`: FK to `Sis_propietarios.id`
- **Validation Rules**:
  - `id_usuario` + `id_empresa` format a unique compound index (a user can't be added to the same company twice).
  - Must use `requestContext.values.ownerId` indirectly only when required, but for this specific table (admin context), it acts as the bridge.

## Schema Definitions (Zod)

```typescript
// Application/Auth.types.ts (or User.types.ts)
const EmpresaAsignadaSchema = z.object({
  id_empresa: z.number(),
  nombre: z.string(),
  imagen: z.string().nullable().optional(),
});

const LoginResponseSchema = z.object({
  token: z.string(),
  empresas: z.array(EmpresaAsignadaSchema),
  message: z.string().optional(),
});
```

## State Transitions

1. **User Login Attempt**: Valid credentials -> fetch pairs `(userId, ownerId)` from `Empresas_usuarios`. Join `Sis_propietarios` to get `nombre` and `imagen`.
2. **0 Empresas**: State = `ACCESS_DENIED`. Drop token or discard session, show error.
3. **1 Empresa**: State = `AUTO_SELECTED`. Directly inject `id_empresa` into session context.
4. **> 1 Empresas**: State = `AWAITING_SELECTION`. Give token but hold dashboard access; route to `<SelectCompanyScreen>`.
