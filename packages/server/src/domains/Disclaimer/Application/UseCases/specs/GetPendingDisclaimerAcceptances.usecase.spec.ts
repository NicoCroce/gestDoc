import { describe, expect, it, vi, beforeEach } from 'vitest';
import { RequestContext } from '@server/Application';
import { GetPendingDisclaimerAcceptances } from '../GetPendingDisclaimerAcceptances.usecase';

const requestContext = new RequestContext(1, 'req-1', 42);

describe('GetPendingDisclaimerAcceptances (US5 — términos sin aceptar)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('delegates to the repository with the requestContext and returns employees without acceptance', async () => {
    const records = [
      {
        employeeId: 4,
        employeeName: 'Ana Ruiz',
        employeeEmail: 'ana@test.com',
      },
    ];
    const mockRepo = {
      getEmployeesWithoutDisclaimerAcceptance: vi
        .fn()
        .mockResolvedValue(records),
    };

    const useCase = new GetPendingDisclaimerAcceptances(
      mockRepo as never,
      { execute: vi.fn().mockResolvedValue(true) } as never,
    );
    const result = await useCase.execute({ requestContext });

    expect(
      mockRepo.getEmployeesWithoutDisclaimerAcceptance,
    ).toHaveBeenCalledWith({ requestContext });
    expect(requestContext.values.ownerId).toBe(42);
    expect(result).toEqual(records);
  });

  it('returns an empty list when every employee accepted the terms', async () => {
    const mockRepo = {
      getEmployeesWithoutDisclaimerAcceptance: vi.fn().mockResolvedValue([]),
    };

    const useCase = new GetPendingDisclaimerAcceptances(
      mockRepo as never,
      { execute: vi.fn().mockResolvedValue(true) } as never,
    );
    const result = await useCase.execute({ requestContext });

    expect(result).toEqual([]);
  });

  // ── Gate temprano: sin texto de términos no existe el pendiente (FR-005/FR-009) ──
  it('returns [] without touching the repository when the company has no terms text', async () => {
    const mockRepo = { getEmployeesWithoutDisclaimerAcceptance: vi.fn() };
    const mockHasDisclaimerText = {
      execute: vi.fn().mockResolvedValue(false),
    };
    const useCase = new GetPendingDisclaimerAcceptances(
      mockRepo as never,
      mockHasDisclaimerText as never,
    );

    const result = await useCase.execute({ requestContext });

    expect(result).toEqual([]);
    expect(mockHasDisclaimerText.execute).toHaveBeenCalledWith({
      requestContext,
    });
    expect(
      mockRepo.getEmployeesWithoutDisclaimerAcceptance,
    ).not.toHaveBeenCalled();
  });

  it('counts users without acceptance only when the company has terms text', async () => {
    const records = [
      {
        employeeId: 9,
        employeeName: 'Iván Soto',
        employeeEmail: 'ivan@test.com',
      },
    ];
    const mockRepo = {
      getEmployeesWithoutDisclaimerAcceptance: vi
        .fn()
        .mockResolvedValue(records),
    };
    const mockHasDisclaimerText = {
      execute: vi.fn().mockResolvedValue(true),
    };
    const useCase = new GetPendingDisclaimerAcceptances(
      mockRepo as never,
      mockHasDisclaimerText as never,
    );

    const result = await useCase.execute({ requestContext });

    expect(result).toEqual(records);
    expect(
      mockRepo.getEmployeesWithoutDisclaimerAcceptance,
    ).toHaveBeenCalledWith({ requestContext });
  });
});
