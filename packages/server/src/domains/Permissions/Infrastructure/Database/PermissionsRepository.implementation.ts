import { UserModel } from '@server/domains/Users';
import {
  IAssociateUserToRoleRepository,
  IDissociateUserToRoleRepository,
  IGetAdminsRepository,
  IGetPermissionsByUserRepository,
  IGetPermissionsRepository,
  IGetRoleByUserRepository,
  IGetRolesRepository,
  Permissions,
  PermissionsRepository,
  Roles,
} from '../../Domain';
import { RolesModel } from './Roles.model';
import { PermissionsModel } from './Permissions.model';
import { Users_RolesModel } from './Users_Roles.model';
import { Op } from 'sequelize';

export class PermissionsRepositoryImplementation
  implements PermissionsRepository
{
  async getRoles(_params: IGetRolesRepository): Promise<Roles[]> {
    const roles = await RolesModel.findAll({
      where: { id: { [Op.not]: 2 } },
    });

    return roles.map((rol) =>
      Roles.create({
        name: rol.denominacion,
        description: '',
        permissions: [],
      }),
    );
  }

  async getPermissions({
    requestContext: _,
  }: IGetPermissionsRepository): Promise<Permissions[]> {
    throw new Error('Method not implemented.');
  }

  async getPermissionsByUser({
    requestContext,
  }: IGetPermissionsByUserRepository): Promise<string[]> {
    const userId = requestContext.values.userId;

    const user = await UserModel.findOne({
      where: { id: userId },
      include: [
        {
          model: RolesModel,
          through: { attributes: [] },
          include: [
            {
              model: PermissionsModel,
              through: { attributes: [] },
            },
          ],
        },
      ],
    });

    if (!user) {
      throw new Error(`Usuario con ID ${userId} no encontrado`);
    }

    const roles = user?.RolesModels;

    const permissions = roles?.flatMap((rol) => rol.PermissionsModels) || null;

    if (!permissions) {
      throw new Error(`Permisos para Usuario con ID ${userId} no encontrado`);
    }

    return permissions.map((p) => p.codigo);
  }

  async associateUserToRole({
    userId,
    role,
  }: IAssociateUserToRoleRepository): Promise<void> {
    // Buscar si ya existe una relación entre el usuario y un rol
    const existingRelation = await Users_RolesModel.findOne({
      where: { id_usuario: userId },
    });

    const existingRol = await RolesModel.findOne({
      where: { denominacion: role },
    });

    if (!existingRol) throw new Error('Rol no encontrado');

    const newRoleId = existingRol.id;

    if (existingRelation) {
      // Si ya tiene un rol asignado, actualizar el rol
      if (existingRelation.id_rol !== newRoleId) {
        await existingRelation.update({ id_rol: newRoleId });
      }
    } else {
      // Si no tiene un rol asignado, crear una nueva relación
      await Users_RolesModel.create({
        id_usuario: userId,
        id_rol: newRoleId,
      });
    }
  }

  async dissociateUserToRole({
    userId,
  }: IDissociateUserToRoleRepository): Promise<void> {
    await Users_RolesModel.destroy({
      where: { id_usuario: userId },
    });
  }

  async getRoleByUser({
    userId,
  }: IGetRoleByUserRepository): Promise<string | null> {
    const foundRole = await Users_RolesModel.findOne({
      where: { id_usuario: userId },
    });

    if (!foundRole) return null;

    const roleName = await RolesModel.findOne({
      where: { id: foundRole.id_rol },
    });

    return roleName?.denominacion || null;
  }

  async getAdmins({ requestContext }: IGetAdminsRepository): Promise<string[]> {
    const users = await UserModel.findAll({
      where: { id_propietario: requestContext.values.ownerId },
      include: [
        {
          model: Users_RolesModel,
          as: 'UsersRoles',
          where: { id_rol: 1 },
          attributes: [], // Evita traer datos innecesarios de la relación
        },
      ],
    });

    if (!users) {
      throw new Error(`No se encontraron admins`);
    }

    return users.map(({ email }) => email);
  }
}
