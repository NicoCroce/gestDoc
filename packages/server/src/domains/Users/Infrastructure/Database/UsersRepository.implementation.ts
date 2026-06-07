import {
  IRenewPasswordRepository,
  IChangePasswordRepository,
  IGetEmailsByUsersIdRepository,
  IValidateUserRepository,
  User,
  UserRepository,
  IGetUserRepository,
} from '../../Domain';

import { UserModel } from './Users.model';
import { CompaniesModel } from '@server/domains/Companies/Infrastructure';

export class UsersRepositoryImplementation implements UserRepository {
  async getUser({
    id,
    requestContext,
  }: IGetUserRepository): Promise<User | null> {
    const whereClause: { [key: string]: unknown } = { id };

    if (requestContext?.values.ownerId) {
      whereClause.id_propietario = requestContext.values.ownerId;
    }

    const userFound = await UserModel.findOne({ where: whereClause });
    if (!userFound) {
      return null;
    }
    const { email, nombre } = userFound;
    return User.create({
      id,
      mail: email,
      name: nombre,
      ownerId: userFound.id_propietario,
    });
  }
  async validateUser({
    mail,
    id,
  }: IValidateUserRepository): Promise<User | null> {
    const whereClause: { [key: string]: unknown } = mail
      ? { email: mail }
      : { id };

    const user = await UserModel.findOne<UserModel>({
      where: whereClause,
      include: [
        {
          model: CompaniesModel,
          attributes: ['denominacion', 'logo'],
        },
      ],
    });

    if (!user) return null;

    return User.create({
      id: user.id,
      mail: user.email,
      name: user.nombre,
      password: user.clave,
      renewPassword: user.renovar_clave,
      userImage: user.imagen,
      ownerId: user.id_propietario,
      companyLogo: user?.CompaniesModel?.logo || '',
      companyName: user?.CompaniesModel?.denominacion,
    });
  }

  async changePassword({
    password,
    requestContext,
  }: IChangePasswordRepository): Promise<void | null> {
    const id = requestContext.values.userId;
    const whereClause: { [key: string]: unknown } = { id };

    if (requestContext.values.ownerId) {
      whereClause.id_propietario = requestContext.values.ownerId;
    }

    const rowsAffected = await UserModel.update(
      { clave: password, renovar_clave: false },
      { where: whereClause },
    );

    if (!id || !rowsAffected[0]) return null;
  }

  async getEmailsByUsersId({
    userIds,
    requestContext,
  }: IGetEmailsByUsersIdRepository): Promise<string[]> {
    const {
      values: { ownerId },
    } = requestContext;

    const whereClause: { [key: string]: unknown } = {
      id: userIds,
    };

    if (ownerId) {
      whereClause.id_propietario = ownerId;
    }

    const users = await UserModel.findAll({
      attributes: ['email'],
      where: whereClause,
    });

    return users
      .map((user) => user.email)
      .filter((email) => email && email.trim() !== '');
  }

  async renewPassword(params: IRenewPasswordRepository): Promise<void | null> {
    const { mail, password } = params;

    const rowsAffected = await UserModel.update(
      { clave: password },
      { where: { email: mail } },
    );

    if (!mail || !rowsAffected[0]) return null;
  }
}
