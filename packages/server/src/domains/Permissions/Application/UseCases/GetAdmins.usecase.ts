import { IUseCase } from '@server/Application/Interfaces/IUseCase';
import { IGetRoles } from '../Roles.interfaces';
import { PermissionsRepository } from '../Permissions.repository';
import { AppError } from '@server/Application';

export class GetAdmins implements IUseCase<string[]> {
  constructor(private permissionsRepository: PermissionsRepository) {}

  async execute({ requestContext }: IGetRoles): Promise<string[]> {
    try {
      return await this.permissionsRepository.getAdmins({
        requestContext,
      });
    } catch (error) {
      throw new AppError(`No se obtuvieorn los admins: ${error}`);
    }
  }
}
