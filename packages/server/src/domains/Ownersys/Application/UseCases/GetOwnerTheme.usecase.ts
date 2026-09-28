import { IUseCase } from '@server/Application';
import { OwnersysRepository } from '../../Domain';
import { IGetOwnerTheme } from '../ownersys.types';

export class GetOwnerTheme implements IUseCase<number> {
  constructor(private readonly ownersysRepository: OwnersysRepository) {}

  async execute({ requestContext }: IGetOwnerTheme): Promise<number> {
    const tema = await this.ownersysRepository.getOwnerTheme({
      requestContext,
    });

    if (tema === null) {
      return 1;
    }

    return tema;
  }
}
