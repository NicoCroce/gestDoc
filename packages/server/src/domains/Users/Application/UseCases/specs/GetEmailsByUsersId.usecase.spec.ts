import { describe, expect, it, vi } from 'vitest';
import { GetEmailsByUsersId } from '../GetEmailsByUsersId.usecase';
import { RequestContext } from '@server/Application';

const requestContext = new RequestContext(1, 'req-1', 10);

describe('GetEmailsByUsersId usecase', () => {
  it('calls getEmailsByUsersId on the repository and returns email list', async () => {
    const emails = ['a@test.com', 'b@test.com'];
    const repository = {
      getEmailsByUsersId: vi.fn().mockResolvedValue(emails),
    };

    const useCase = new GetEmailsByUsersId(repository as never);
    const result = await useCase.execute({ input: [1, 2], requestContext });

    expect(result).toBe(emails);
    expect(repository.getEmailsByUsersId).toHaveBeenCalledWith({
      userIds: [1, 2],
      requestContext,
    });
  });

  // ── Regresión T004 (007-exclude-deleted-users-emails, Contrato 1) ────────
  // El repositorio real (UsersRepositoryImplementation.getEmailsByUsersId)
  // excluye soft-deleted vía `paranoid: true` de UserModel. Este test valida
  // que el use case es un delegado fiel: reenvía exactamente el array
  // resultante (ya filtrado), sin reintroducir ni recalcular nada.
  it('returns only the emails of active users when the id array includes a soft-deleted user', async () => {
    // Batch pedido: [1, 2, 3] → el usuario 2 está soft-deleted, el repositorio
    // (paranoid) nunca lo incluye en el resultado.
    const emailsWithoutDeletedUser = ['juan@test.com', 'carlos@test.com'];
    const repository = {
      getEmailsByUsersId: vi.fn().mockResolvedValue(emailsWithoutDeletedUser),
    };

    const useCase = new GetEmailsByUsersId(repository as never);
    const result = await useCase.execute({
      input: [1, 2, 3],
      requestContext,
    });

    expect(repository.getEmailsByUsersId).toHaveBeenCalledWith({
      userIds: [1, 2, 3],
      requestContext,
    });
    expect(result).toEqual(emailsWithoutDeletedUser);
    expect(result).toHaveLength(2);
  });

  it('returns [] without throwing when every candidate user is soft-deleted', async () => {
    const repository = {
      getEmailsByUsersId: vi.fn().mockResolvedValue([]),
    };

    const useCase = new GetEmailsByUsersId(repository as never);
    const result = await useCase.execute({ input: [4, 5], requestContext });

    expect(result).toEqual([]);
  });
});
