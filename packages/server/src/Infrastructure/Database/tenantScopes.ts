import { Model, ModelStatic } from 'sequelize';

/**
 * Apply (or replace) a dynamic Sequelize scope named `'tenant'` on `model`,
 * filtering by the given `ownerId` through the `id_propietario` column.
 *
 * **Defence-in-depth layer.** The primary tenant isolation lives in the
 * `TenantAwareRepository` helpers and the explicit `where` clauses built by
 * each repository implementation. This scope is a safety net: if a query
 * accidentally forgets to filter by `id_propietario`, calling
 * `Model.scope('tenant').findAll()` will still restrict results.
 *
 * ### ⚠️ Concurrency caveat
 *
 * Sequelize scopes are stored at the **class level** (global singleton).
 * In a concurrent HTTP server two requests from different tenants can
 * interleave between `addScope()` and the actual query, causing the
 * wrong `ownerId` to be applied. For this reason:
 *
 * 1. The `'tenant'` scope should **never** be the sole isolation
 *    mechanism — always pair it with explicit `where` clauses or the
 *    `TenantAwareRepository` helpers.
 * 2. Prefer `Model.scope('tenant')` only in code paths that are
 *    guaranteed to run synchronously after `addTenantScope()` within
 *    the same tick (e.g. inside a tRPC resolver that reads the ownerId
 *    from `requestContext`).
 *
 * @param model  - The Sequelize model class to scope.
 * @param ownerId - The tenant identifier to filter by.
 * @param tenantColumn - Column name (defaults to `'id_propietario'`).
 */
export const addTenantScope = (
  model: ModelStatic<Model>,
  ownerId: number,
  tenantColumn = 'id_propietario',
): void => {
  model.addScope(
    'tenant',
    { where: { [tenantColumn]: ownerId } },
    { override: true },
  );
};

interface TenantScopedModelEntry {
  model: ModelStatic<Model>;
  tenantColumn: string;
}

const tenantScopedModels: TenantScopedModelEntry[] = [];

/**
 * Self-registration hook for tenant-scoped models.
 *
 * **Por qué existe.** Antes, el código genérico de tRPC (`TrpcInstance.ts`)
 * importaba `UserModel`, `ProfileModel` y `TiposSegmentosModel` por nombre
 * desde sus respectivos dominios para aplicarles `addTenantScope`. Eso crea
 * una dependencia inversa (Infraestructura transversal → Dominio) que, al
 * combinarse con los barrels de dominio, generaba ciclos de import.
 *
 * Con este registro, cada modelo se auto-declara tenant-scoped **en su
 * propio archivo de definición** (Dominio → mecanismo genérico, la dirección
 * permitida), y el código transversal solo itera el registro sin conocer
 * los nombres de los modelos. Ver `applyAllTenantScopes`.
 *
 * @param model - El modelo Sequelize a registrar.
 * @param tenantColumn - Columna de propietario (default `'id_propietario'`).
 */
export const registerTenantScopedModel = (
  model: ModelStatic<Model>,
  tenantColumn = 'id_propietario',
): void => {
  tenantScopedModels.push({ model, tenantColumn });
};

/**
 * Aplica el scope `'tenant'` a todos los modelos que se auto-registraron
 * vía `registerTenantScopedModel`. Pensado para llamarse una vez por
 * request (ver `TrpcInstance.ts`), sin necesidad de conocer qué modelos
 * existen.
 */
export const applyAllTenantScopes = (ownerId: number): void => {
  for (const { model, tenantColumn } of tenantScopedModels) {
    addTenantScope(model, ownerId, tenantColumn);
  }
};
