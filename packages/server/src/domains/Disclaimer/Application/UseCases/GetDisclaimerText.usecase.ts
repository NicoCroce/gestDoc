import { IUseCase } from '@server/Application';
import { OwnersyssRepository } from '@server/domains/Ownersyss';
import { IGetDisclaimerText } from '../disclaimer.types';

export class GetDisclaimerText implements IUseCase<string, number> {
  constructor(private readonly ownersyssRepository: OwnersyssRepository) {}

  async execute({
    input: ownerId,
    requestContext,
  }: IGetDisclaimerText): Promise<string> {
    const ownersys = await this.ownersyssRepository.getOwnersys({
      id: ownerId,
      requestContext,
    });

    return ownersys?.values.texto_disclaimer || '';
  }
}
