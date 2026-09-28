import crypto from 'crypto';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { AppError, RequestContext } from '@server/Application';
import { SignDisclaimer } from '../SignDisclaimer.usecase';

const requestContext = new RequestContext(1, 'req-1', 99);

function computeExpectedHash(userId: number, timestamp: string): string {
  return crypto
    .createHmac('sha256', 'test-secret')
    .update(`${userId}:${timestamp}`)
    .digest('hex');
}

describe('SignDisclaimer', () => {
  beforeEach(() => {
    process.env.SECRET_KEY_BACK = 'test-secret';
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    delete process.env.SECRET_KEY_BACK;
    vi.useRealTimers();
  });

  it('signs with valid password and persists signature', async () => {
    const mockRepo = {
      sign: vi.fn().mockResolvedValue({ values: { id: 1 } }),
    };
    const mockValidateUserPassword = {
      execute: vi.fn().mockResolvedValue({ password: 'hashed-password-value' }),
    };

    const useCase = new SignDisclaimer(
      mockRepo as never,
      mockValidateUserPassword as never,
    );

    const result = await useCase.execute({
      input: {
        password: 'correct-password',
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      },
      requestContext,
    });

    const now = new Date('2024-01-01T00:00:00.000Z');
    const expectedHash = computeExpectedHash(1, now.toISOString());

    expect(mockValidateUserPassword.execute).toHaveBeenCalledWith({
      input: { id: 1, password: 'correct-password' },
      requestContext,
    });
    expect(mockRepo.sign).toHaveBeenCalledWith({
      userId: 1,
      ownerId: 99,
      hash: expectedHash,
      ip: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
      timestamp: now,
      requestContext,
    });
    expect(result).toEqual({ values: { id: 1 } });
  });

  it('throws 401 when password is wrong', async () => {
    const mockRepo = {
      sign: vi.fn(),
    };
    const mockValidateUserPassword = {
      execute: vi
        .fn()
        .mockRejectedValue(new AppError('Contraseña incorrecta', 401)),
    };

    const useCase = new SignDisclaimer(
      mockRepo as never,
      mockValidateUserPassword as never,
    );

    await expect(
      useCase.execute({
        input: {
          password: 'wrong-password',
          ip: '192.168.1.1',
          userAgent: null,
        },
        requestContext,
      }),
    ).rejects.toMatchObject({ message: 'Contraseña incorrecta' });

    expect(mockRepo.sign).not.toHaveBeenCalled();
  });

  it('throws 404 when user is not found', async () => {
    const mockRepo = { sign: vi.fn() };
    const mockValidateUserPassword = {
      execute: vi
        .fn()
        .mockRejectedValue(new AppError('Usuario no encontrado', 404)),
    };

    const useCase = new SignDisclaimer(
      mockRepo as never,
      mockValidateUserPassword as never,
    );

    await expect(
      useCase.execute({
        input: {
          password: 'any-password',
          ip: '10.0.0.1',
          userAgent: null,
        },
        requestContext,
      }),
    ).rejects.toMatchObject({ message: 'Usuario no encontrado' });

    expect(mockRepo.sign).not.toHaveBeenCalled();
  });
});
