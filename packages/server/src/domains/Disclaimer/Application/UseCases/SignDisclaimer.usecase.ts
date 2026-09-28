import crypto from 'node:crypto';
import { executeUseCase, IUseCase } from '@server/Application';
import { ValidateUserPassword } from '@server/domains/Users';
import { DisclaimerAcceptance, DisclaimerRepository } from '../../Domain';
import { ISignDisclaimer } from '../disclaimer.types';

export class SignDisclaimer implements IUseCase<
  DisclaimerAcceptance,
  ISignDisclaimerInput
> {
  constructor(
    private readonly disclaimerRepository: DisclaimerRepository,
    // Cross-domain: caso de uso de Users, no el repositorio (skill cross-domain-relations).
    private readonly _validateUserPassword: ValidateUserPassword,
  ) {}

  async execute({
    input,
    requestContext,
  }: ISignDisclaimer): Promise<DisclaimerAcceptance> {
    // Lanza AppError(404) / AppError(401) si el usuario no existe o la
    // contraseña es incorrecta — mismo comportamiento que antes, ahora
    // encapsulado en el caso de uso dueño de esa regla (Users).
    await executeUseCase({
      useCase: this._validateUserPassword,
      input: { id: requestContext.values.userId, password: input.password },
      requestContext,
    });

    const now = new Date();
    now.setMilliseconds(0);
    const secret = process.env.SECRET_KEY_BACK || 'default-secret';
    const payload = `${requestContext.values.userId}:${now.toISOString()}`;
    const hash = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    return this.disclaimerRepository.sign({
      userId: requestContext.values.userId,
      ownerId: requestContext.values.ownerId,
      hash,
      ip: input.ip,
      userAgent: input.userAgent ?? null,
      timestamp: now,
      requestContext,
    });
  }
}

export interface ISignDisclaimerInput {
  password: string;
  ip: string;
  userAgent: string | null;
}
