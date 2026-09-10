import { describe, expect, it, vi } from 'vitest';
import { RequestContext } from '@server/Application';
import { SendReminders } from '../SendReminders.usecase';

const requestContext = new RequestContext(1, 'req-1', 99);

const createIsDisclaimerEnabled = (enabled: boolean) => ({
  execute: vi.fn().mockResolvedValue(enabled),
});

describe('SendReminders', () => {
  it('sends emails to all pending employees', async () => {
    const mockRepo = {
      getPendingEmployeeIds: vi.fn().mockResolvedValue([1, 2, 3]),
    };
    const mockUserRepo = {
      getEmailsByUsersId: vi
        .fn()
        .mockResolvedValue([
          'juan@test.com',
          'maria@test.com',
          'carlos@test.com',
        ]),
    };
    const mockEmailSender = {
      sendDisclaimerReminders: vi.fn().mockResolvedValue(undefined),
    };
    const mockOwnersysRepo = {
      getOwnersys: vi.fn().mockResolvedValue({
        values: {
          denominacion: 'Empresa Test',
          texto_disclaimer: 'Texto del disclaimer',
        },
      }),
    };

    const useCase = new SendReminders(
      mockRepo as never,
      mockUserRepo as never,
      mockEmailSender as never,
      mockOwnersysRepo as never,
      createIsDisclaimerEnabled(true) as never,
    );

    const result = await useCase.execute({
      input: {},
      requestContext,
    });

    expect(result.sent).toBe(3);
    expect(result.failed).toBe(0);
    expect(result.total).toBe(3);
    expect(mockEmailSender.sendDisclaimerReminders).toHaveBeenCalledWith({
      to: ['juan@test.com', 'maria@test.com', 'carlos@test.com'],
      disclaimerText: 'Texto del disclaimer',
      companyName: 'Empresa Test',
    });
  });

  it('does not send emails when disclaimer is not enabled', async () => {
    const mockRepo = {
      getPendingEmployeeIds: vi.fn().mockResolvedValue([1, 2, 3]),
    };
    const mockUserRepo = {
      getEmailsByUsersId: vi.fn(),
    };
    const mockEmailSender = {
      sendDisclaimerReminders: vi.fn(),
    };
    const mockOwnersysRepo = {
      getOwnersys: vi.fn(),
    };

    const useCase = new SendReminders(
      mockRepo as never,
      mockUserRepo as never,
      mockEmailSender as never,
      mockOwnersysRepo as never,
      createIsDisclaimerEnabled(false) as never,
    );

    const result = await useCase.execute({
      input: {},
      requestContext,
    });

    expect(result.sent).toBe(0);
    expect(result.failed).toBe(0);
    expect(result.total).toBe(0);
    expect(mockRepo.getPendingEmployeeIds).not.toHaveBeenCalled();
    expect(mockOwnersysRepo.getOwnersys).not.toHaveBeenCalled();
    expect(mockEmailSender.sendDisclaimerReminders).not.toHaveBeenCalled();
  });

  it('uses provided ownerId when given (superadmin)', async () => {
    const mockRepo = {
      getPendingEmployeeIds: vi.fn().mockResolvedValue([1]),
    };
    const mockUserRepo = {
      getEmailsByUsersId: vi.fn().mockResolvedValue(['juan@test.com']),
    };
    const mockEmailSender = {
      sendDisclaimerReminders: vi.fn().mockResolvedValue(undefined),
    };
    const mockOwnersysRepo = {
      getOwnersys: vi.fn().mockResolvedValue({
        values: {
          denominacion: 'Empresa Test',
          texto_disclaimer: 'Texto del disclaimer',
        },
      }),
    };

    const useCase = new SendReminders(
      mockRepo as never,
      mockUserRepo as never,
      mockEmailSender as never,
      mockOwnersysRepo as never,
      createIsDisclaimerEnabled(true) as never,
    );

    await useCase.execute({
      input: { ownerId: 200 },
      requestContext,
    });

    expect(mockRepo.getPendingEmployeeIds).toHaveBeenCalledWith({
      ownerId: 200,
      requestContext,
    });
  });
});
