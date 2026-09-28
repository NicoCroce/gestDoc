import { IUseCase } from '@server/Application';
import { OwnersysRepository } from '@server/domains/Ownersys';
import { IGetDisclaimerText } from '../disclaimer.types';

export class GetDisclaimerText implements IUseCase<string, number> {
  constructor(private readonly ownersysRepository: OwnersysRepository) {}

  async execute({
    input: ownerId,
    requestContext,
  }: IGetDisclaimerText): Promise<string> {
    const ownersys = await this.ownersysRepository.getOwnersys({
      id: ownerId,
      requestContext,
    });

    return ownersys?.values.texto_disclaimer || '';
  }
}
