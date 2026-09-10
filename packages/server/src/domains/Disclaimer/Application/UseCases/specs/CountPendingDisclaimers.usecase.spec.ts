import { describe, expect, it, vi } from 'vitest';
import { RequestContext } from '@server/Application';
import { CountPendingDisclaimers } from '../CountPendingDisclaimers.usecase';

const requestContext = new RequestContext(1, 'req-1', 42);

const createIsDisclaimerEnabled = (enabled: boolean) => ({
  execute: vi.fn().mockResolvedValue(enabled),
});

describe('CountPendingDisclaimers', () => {
  it('returns the pending count from the repository', async () => {
    const mockRepo = {
      countPendingDisclaimers: vi.fn().mockResolvedValue(5),
    };

    const useCase = new CountPendingDisclaimers(
      mockRepo as never,
      createIsDisclaimerEnabled(true) as never,
    );
    const result = await useCase.execute({ requestContext });

    expect(result).toBe(5);
    expect(mockRepo.countPendingDisclaimers).toHaveBeenCalledWith({
      requestContext,
    });
  });

  it('returns zero when disclaimer is not enabled', async () => {
    const mockRepo = {
      countPendingDisclaimers: vi.fn(),
    };

    const useCase = new CountPendingDisclaimers(
      mockRepo as never,
      createIsDisclaimerEnabled(false) as never,
    );
    const result = await useCase.execute({ requestContext });

    expect(result).toBe(0);
    expect(mockRepo.countPendingDisclaimers).not.toHaveBeenCalled();
  });
});
