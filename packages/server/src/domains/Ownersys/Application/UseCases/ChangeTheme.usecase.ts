import { AppError, IUseCase } from '@server/Application';
import { OwnersysRepository } from '../../Domain';
import { IUpdateTheme } from '../ownersys.types';

export class ChangeTheme implements IUseCase<number> {
  constructor(private readonly ownersysRepository: OwnersysRepository) {}

  async execute({ input: id, requestContext }: IUpdateTheme): Promise<number> {
    const idret = await this.ownersysRepository.updateTheme({
      tema: id,
      requestContext,
    });

    if (!idret) {
      throw new AppError('No se pudo Actualizar el Tema');
    }

    return idret;
  }
}
