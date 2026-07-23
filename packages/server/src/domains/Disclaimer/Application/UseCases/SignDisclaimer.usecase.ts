import crypto from 'node:crypto';
import { AppError, IUseCase } from '@server/Application';
import { comparePassword } from '@server/Infrastructure/utils/bcrypt';
import { UserRepository } from '@server/domains/Users';
import { DisclaimerAcceptance, DisclaimerRepository } from '../../Domain';
import { ISignDisclaimer } from '../disclaimer.types';

export class SignDisclaimer implements IUseCase<
  DisclaimerAcceptance,
  ISignDisclaimerInput
> {
  constructor(
    private readonly disclaimerRepository: DisclaimerRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute({
    input,
    requestContext,
  }: ISignDisclaimer): Promise<DisclaimerAcceptance> {
    const user = await this.userRepository.validateUser({
      id: requestContext.values.userId,
      requestContext,
    });

    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    const isPasswordValid = await comparePassword(
      input.password,
      user.password || '',
    );

    if (!isPasswordValid) {
      throw new AppError('Contraseña incorrecta', 401);
    }

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
