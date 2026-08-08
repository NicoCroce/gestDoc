import { Model, ModelStatic, FindOptions, CreateOptions } from 'sequelize';
import { AppError } from '@server/Application';

/**
 * Abstract base class for multi-tenant repositories.
 *
 * Centralises the `id_propietario` filtering pattern so that every
 * repository that works with a tenant-owned model can reuse the same
 * guarded helpers instead of repeating `where: { id_propietario: ownerId }`
 * in every method.
 *
 * **Defence-in-depth:** `tenantUpdate` and `tenantDelete` verify that the
 * target record belongs to the calling tenant before mutating. If the
 * record does not exist OR belongs to another tenant, a 404 `AppError` is
 * thrown — this prevents IDOR attacks where a client supplies a valid ID
 * that belongs to a different company.
 *
 * Models that use a column name other than `id_propietario` (e.g.
 * `DisclaimerAcceptanceModel` which uses `id_empresa`) can pass a custom
 * `tenantColumn` override to each helper.
 */
export abstract class TenantAwareRepository {
  // ─── Read helpers ────────────────────────────────────────────────────────

  /**
   * Find all rows of `model` filtered by `ownerId`, merged with any
   * additional `options` (pagination, includes, ordering, etc.).
   */
  protected async tenantFindAll<M extends Model>(
    model: ModelStatic<M>,
    options: FindOptions = {},
    ownerId: number,
    tenantColumn = 'id_propietario',
  ): Promise<M[]> {
    return model.findAll({
      ...options,
      where: {
        ...((options.where as Record<string, unknown>) ?? {}),
        [tenantColumn]: ownerId,
      },
    } as FindOptions);
  }

  /**
   * Find a single row of `model` filtered by `ownerId`, merged with any
   * additional `options` (includes, etc.). Returns `null` when not found.
   */
  protected async tenantFindOne<M extends Model>(
    model: ModelStatic<M>,
    options: FindOptions = {},
    ownerId: number,
    tenantColumn = 'id_propietario',
  ): Promise<M | null> {
    return model.findOne({
      ...options,
      where: {
        ...((options.where as Record<string, unknown>) ?? {}),
        [tenantColumn]: ownerId,
      },
    } as FindOptions);
  }

  // ─── Write helpers ───────────────────────────────────────────────────────

  /**
   * Create a row in `model`, automatically injecting `id_propietario`.
   */
  protected async tenantCreate<M extends Model>(
    model: ModelStatic<M>,
    data: Record<string, unknown>,
    ownerId: number,
    tenantColumn = 'id_propietario',
    options: CreateOptions = {},
  ): Promise<M> {
    return model.create(
      { ...data, [tenantColumn]: ownerId } as Parameters<M['create']>[0],
      options,
    );
  }

  /**
   * Update a row by `id` **only if** it belongs to `ownerId`.
   *
   * Throws `AppError('Record not found', 404)` when:
   * - no row with that `id` exists, OR
   * - the row exists but belongs to a different tenant.
   *
   * Returns the updated model instance.
   */
  protected async tenantUpdate<M extends Model>(
    model: ModelStatic<M>,
    id: number,
    data: Record<string, unknown>,
    ownerId: number,
    tenantColumn = 'id_propietario',
  ): Promise<M> {
    const existing = await model.findOne({
      where: { id, [tenantColumn]: ownerId },
    } as FindOptions);

    if (!existing) {
      throw new AppError('Record not found', 404, 'NOT_FOUND');
    }

    await existing.update(data as Parameters<M['update']>[0]);
    return existing;
  }

  /**
   * Delete a row by `id` **only if** it belongs to `ownerId`.
   *
   * Throws `AppError('Record not found', 404)` when:
   * - no row with that `id` exists, OR
   * - the row exists but belongs to a different tenant.
   *
   * Returns the deleted row's `id`.
   */
  protected async tenantDelete(
    model: ModelStatic<Model>,
    id: number,
    ownerId: number,
    tenantColumn = 'id_propietario',
  ): Promise<number> {
    const existing = await model.findOne({
      where: { id, [tenantColumn]: ownerId },
    } as FindOptions);

    if (!existing) {
      throw new AppError('Record not found', 404, 'NOT_FOUND');
    }

    await existing.destroy();
    return id;
  }
}
