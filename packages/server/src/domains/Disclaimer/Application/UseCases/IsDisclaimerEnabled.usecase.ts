import { IUseCase, RequestContext } from '@server/Application';
import { OwnersyssRepository } from '@server/domains/Ownersyss';

export class IsDisclaimerEnabled implements IUseCase<boolean, number> {
  constructor(private readonly ownersyssRepository: OwnersyssRepository) {}

  async execute({
    input: ownerId,
    requestContext,
  }: {
    input?: number;
    requestContext: RequestContext;
  }): Promise<boolean> {
    if (ownerId === undefined) {
      return false;
    }

    const ownersys = await this.ownersyssRepository.getOwnersys({
      id: ownerId,
      requestContext,
    });

    return (
      process.env.ENABLE_DISCLAIMER === 'true' &&
      !!ownersys?.values.texto_disclaimer?.trim()
    );
  }
}
