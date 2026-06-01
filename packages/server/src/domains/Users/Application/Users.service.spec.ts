import { RequestContext } from '@server/Application';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UsersService } from './Users.service';

vi.mock('@server/Application/Adapters/ExecuteUseCase', () => ({
  executeUseCase: vi.fn(),
}));

import { executeUseCase as executeUseCaseMock } from '@server/Application/Adapters/ExecuteUseCase';

describe('UsersService', () => {
  const requestContext = new RequestContext(1, 'req-1', 10);

  beforeEach(() => vi.clearAllMocks());

  const buildService = () =>
    new UsersService(
      {} as never, // getUser
    );

  it('delegates changePassword to executeUseCase', async () => {
    vi.mocked(executeUseCaseMock).mockResolvedValue(undefined as never);

    const service = buildService();
    await expect(
      service.changePassword({
        input: { password: 'old', newPassword: 'new', rePassword: 'new' },
        requestContext,
      }),
    ).resolves.toBeUndefined();
  });
});
