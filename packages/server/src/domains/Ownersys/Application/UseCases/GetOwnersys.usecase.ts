import { AppError, IUseCase } from '@server/Application';
import { OwnersysRepository, Ownersys } from '../../Domain';
import { IGetOwnersys } from '../ownersys.types';

export class GetOwnersys implements IUseCase<Ownersys | null> {
  constructor(private readonly ownersysRepository: OwnersysRepository) {}

  async execute({
    input,
    requestContext,
  }: IGetOwnersys): Promise<Ownersys | null> {
    const id = input;
    const ownersys = await this.ownersysRepository.getOwnersys({
      id,
      requestContext,
    });

    if (!ownersys) throw new AppError('Registro no encontrado', 404);
    return ownersys;
  }
}
