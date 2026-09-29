import { describe, expect, it, vi, beforeEach } from 'vitest';
import { RequestContext } from '@server/Application';
import { HasDisclaimerText } from '../HasDisclaimerText.usecase';

const requestContext = new RequestContext(1, 'req-1', 42);

/**
 * Bandera a nivel empresa (owner-scoped). Resuelve el texto desde
 * `RequestContext.values.ownerId` y aplica la definición única de "sin texto".
 */
describe('HasDisclaimerText (bandera por empresa)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('resolves the text of the owner in the requestContext and returns true for real text', async () => {
    const mockGetDisclaimerText = {
      execute: vi.fn().mockResolvedValue('Términos y condiciones'),
    };
    const useCase = new HasDisclaimerText(mockGetDisclaimerText as never);

    const result = await useCase.execute({ requestContext });

    expect(result).toBe(true);
    expect(mockGetDisclaimerText.execute).toHaveBeenCalledWith({
      input: 42,
      requestContext,
    });
  });

  it('returns false when the owner text is whitespace-only', async () => {
    const mockGetDisclaimerText = {
      execute: vi.fn().mockResolvedValue('   \t\n'),
    };
    const useCase = new HasDisclaimerText(mockGetDisclaimerText as never);

    await expect(useCase.execute({ requestContext })).resolves.toBe(false);
  });

  it('returns false when the owner has no text (empty string)', async () => {
    const mockGetDisclaimerText = { execute: vi.fn().mockResolvedValue('') };
    const useCase = new HasDisclaimerText(mockGetDisclaimerText as never);

    await expect(useCase.execute({ requestContext })).resolves.toBe(false);
  });

  // Multi-tenant (FR-008): la bandera se decide por el owner del contexto,
  // nunca por otro owner.
  it('isolates by owner: resolves the text of the owner in the requestContext, not another owner', async () => {
    const otherOwnerContext = new RequestContext(1, 'req-2', 77);
    const mockGetDisclaimerText = {
      execute: vi
        .fn()
        .mockImplementation((params: { input: number }) =>
          Promise.resolve(params.input === 42 ? 'Texto empresa 42' : ''),
        ),
    };
    const useCase = new HasDisclaimerText(mockGetDisclaimerText as never);

    await expect(useCase.execute({ requestContext })).resolves.toBe(true);
    await expect(
      useCase.execute({ requestContext: otherOwnerContext }),
    ).resolves.toBe(false);

    expect(mockGetDisclaimerText.execute).toHaveBeenNthCalledWith(1, {
      input: 42,
      requestContext,
    });
    expect(mockGetDisclaimerText.execute).toHaveBeenNthCalledWith(2, {
      input: 77,
      requestContext: otherOwnerContext,
    });
  });
});
