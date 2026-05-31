import { IUseCase } from '@server/Application/Interfaces/IUseCase';
import { IGetRoles, PermissionsRepository } from '../../Domain';
import { AppError } from '@server/Application';

export class GetAdmins implements IUseCase<string[]> {
  constructor(private readonly permissionsRepository: PermissionsRepository) {}

  async execute({ requestContext }: IGetRoles): Promise<string[]> {
    try {
      return await this.permissionsRepository.getAdmins({
        requestContext,
      });
    } catch (error) {
      throw new AppError(`No se obtuvieron los admins: ${error}`);
    }
  }
}
