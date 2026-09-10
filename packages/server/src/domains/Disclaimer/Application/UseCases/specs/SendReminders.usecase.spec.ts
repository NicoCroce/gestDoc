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

  // ── Regresión T003 (007-exclude-deleted-users-emails) ────────────────────
  // Contrato 1: getEmailsByUsersId (Users) ya excluye soft-deleted (paranoid).
  // Este use case es agnóstico a esa exclusión: solo debe reenviar exactamente
  // lo que el repositorio de Users le devuelva, sin reintroducir al eliminado.
  it('only forwards emails of active employees when the pending batch mixes active and soft-deleted ids', async () => {
    const mockRepo = {
      // 3 ids pendientes: 1 y 3 activos, 2 pertenece a un empleado soft-deleted
      getPendingEmployeeIds: vi.fn().mockResolvedValue([1, 2, 3]),
    };
    const mockUserRepo = {
      // getEmailsByUsersId (repo real) ya excluye al soft-deleted vía paranoid:
      // dado el batch [1,2,3] devuelve solo 2 emails, no 3.
      getEmailsByUsersId: vi
        .fn()
        .mockResolvedValue(['juan@test.com', 'carlos@test.com']),
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

    const result = await useCase.execute({ input: {}, requestContext });

    // El batch de envío (`to`) NUNCA contiene un email del usuario eliminado
    expect(mockUserRepo.getEmailsByUsersId).toHaveBeenCalledWith({
      userIds: [1, 2, 3],
      requestContext,
    });
    expect(mockEmailSender.sendDisclaimerReminders).toHaveBeenCalledWith({
      to: ['juan@test.com', 'carlos@test.com'],
      disclaimerText: 'Texto del disclaimer',
      companyName: 'Empresa Test',
    });
    expect(
      mockEmailSender.sendDisclaimerReminders.mock.calls[0][0].to,
    ).not.toContain('maria@test.com'); // email del empleado 2 (soft-deleted)

    // El batch se procesó sin error (el repo de Users ya filtró, no hace falta
    // manejo especial acá); sent/total reflejan el tamaño del batch de IDs
    // (diseño actual: no distingue "email resuelto" de "id en el batch").
    expect(result).toEqual({ sent: 3, failed: 0, total: 3 });
  });

  it('returns sent=0/total=0 without throwing when every pending employee is soft-deleted', async () => {
    const mockRepo = {
      // Sin candidatos pendientes tras excluir soft-deleted (o lista vacía real)
      getPendingEmployeeIds: vi.fn().mockResolvedValue([]),
    };
    const mockUserRepo = { getEmailsByUsersId: vi.fn() };
    const mockEmailSender = {
      sendDisclaimerReminders: vi.fn().mockResolvedValue(undefined),
    };
    const mockOwnersysRepo = {
      getOwnersys: vi.fn().mockResolvedValue({
        values: { denominacion: 'Empresa Test', texto_disclaimer: 'Texto' },
      }),
    };

    const useCase = new SendReminders(
      mockRepo as never,
      mockUserRepo as never,
      mockEmailSender as never,
      mockOwnersysRepo as never,
      createIsDisclaimerEnabled(true) as never,
    );

    const result = await useCase.execute({ input: {}, requestContext });

    expect(mockUserRepo.getEmailsByUsersId).not.toHaveBeenCalled();
    expect(mockEmailSender.sendDisclaimerReminders).not.toHaveBeenCalled();
    expect(result).toEqual({ sent: 0, failed: 0, total: 0 });
  });
});
