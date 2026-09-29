import { describe, expect, it, vi, beforeEach } from 'vitest';
import { RequestContext } from '@server/Application';
import { CountPendingDisclaimers } from '../CountPendingDisclaimers.usecase';

const requestContext = new RequestContext(1, 'req-1', 42);

describe('CountPendingDisclaimers (gate por texto de términos)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('delegates to the repository with the requestContext when the company has terms text', async () => {
    const mockRepo = {
      countPendingDisclaimers: vi.fn().mockResolvedValue(8),
    };
    const mockHasDisclaimerText = {
      execute: vi.fn().mockResolvedValue(true),
    };
    const useCase = new CountPendingDisclaimers(
      mockRepo as never,
      mockHasDisclaimerText as never,
    );

    const result = await useCase.execute({ requestContext });

    expect(result).toBe(8);
    expect(mockHasDisclaimerText.execute).toHaveBeenCalledWith({
      requestContext,
    });
    expect(mockRepo.countPendingDisclaimers).toHaveBeenCalledWith({
      requestContext,
    });
  });

  it('returns 0 without touching the repository when the company has no terms text', async () => {
    const mockRepo = { countPendingDisclaimers: vi.fn() };
    const mockHasDisclaimerText = {
      execute: vi.fn().mockResolvedValue(false),
    };
    const useCase = new CountPendingDisclaimers(
      mockRepo as never,
      mockHasDisclaimerText as never,
    );

    const result = await useCase.execute({ requestContext });

    expect(result).toBe(0);
    expect(mockRepo.countPendingDisclaimers).not.toHaveBeenCalled();
  });
});
