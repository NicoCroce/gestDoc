import { afterEach, describe, expect, it, vi } from 'vitest';
import { RequestContext } from '@server/Application';
import { IsDisclaimerEnabled } from '../IsDisclaimerEnabled.usecase';

const requestContext = new RequestContext(1, 'req-1', 99);

const createOwnersysRepo = (textoDisclaimer: string | null | undefined) => ({
  getOwnersys: vi.fn().mockResolvedValue({
    values: { texto_disclaimer: textoDisclaimer },
  }),
});

describe('IsDisclaimerEnabled', () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = originalEnv;
  });

  it('returns false when ENABLE_DISCLAIMER is not true', async () => {
    process.env.ENABLE_DISCLAIMER = 'false';
    const useCase = new IsDisclaimerEnabled(
      createOwnersysRepo('Texto') as never,
    );

    const result = await useCase.execute({ input: 1, requestContext });

    expect(result).toBe(false);
  });

  it('returns false when texto_disclaimer is null', async () => {
    process.env.ENABLE_DISCLAIMER = 'true';
    const useCase = new IsDisclaimerEnabled(createOwnersysRepo(null) as never);

    const result = await useCase.execute({ input: 1, requestContext });

    expect(result).toBe(false);
  });

  it('returns false when texto_disclaimer is undefined', async () => {
    process.env.ENABLE_DISCLAIMER = 'true';
    const useCase = new IsDisclaimerEnabled(
      createOwnersysRepo(undefined) as never,
    );

    const result = await useCase.execute({ input: 1, requestContext });

    expect(result).toBe(false);
  });

  it('returns false when texto_disclaimer is empty', async () => {
    process.env.ENABLE_DISCLAIMER = 'true';
    const useCase = new IsDisclaimerEnabled(createOwnersysRepo('') as never);

    const result = await useCase.execute({ input: 1, requestContext });

    expect(result).toBe(false);
  });

  it('returns false when texto_disclaimer contains only whitespace', async () => {
    process.env.ENABLE_DISCLAIMER = 'true';
    const useCase = new IsDisclaimerEnabled(createOwnersysRepo('   ') as never);

    const result = await useCase.execute({ input: 1, requestContext });

    expect(result).toBe(false);
  });

  it('returns true when ENABLE_DISCLAIMER is true and texto_disclaimer has content', async () => {
    process.env.ENABLE_DISCLAIMER = 'true';
    const useCase = new IsDisclaimerEnabled(
      createOwnersysRepo('Términos y condiciones') as never,
    );

    const result = await useCase.execute({ input: 1, requestContext });

    expect(result).toBe(true);
  });
});
