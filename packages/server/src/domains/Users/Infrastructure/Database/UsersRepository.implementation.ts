import { Op } from 'sequelize';
import {
  IDeleteUserRepository,
  IGetUserRepository,
  IGetUsersRepository,
  IRegisterUserRepository,
  IUpdateUserRepository,
  IValidateUserRepository,
  User,
  UserRepository,
} from '../../Domain';

import { UserScheme } from './Users.scheme';

export class UsersRepositoryImplementation implements UserRepository {
  async getUsers({ filters }: IGetUsersRepository): Promise<User[]> {
    const users = await UserScheme.findAll({
      attributes: ['id', 'email', 'nombre'],
      where: filters?.name
        ? {
            nombre: {
              [Op.substring]: filters?.name,
            },
          }
        : {},
    });
    return users.map((user) => new User(user.id, user.email, user.nombre));
  }

  async registerUser({ user }: IRegisterUserRepository): Promise<User> {
    const newUser = await UserScheme.create({
      nombre: user.mail,
      apellido: '',
      clave: user.password!,
      email: user.mail,
    });
    return new User(newUser.id, newUser.email, newUser.nombre);
  }

  async getUser({ id }: IGetUserRepository): Promise<User | null> {
    const userFound = await UserScheme.findOne({ where: { id } });
    if (!userFound) {
      return null;
    }
    const { id: userId, email, nombre } = userFound;
    return new User(userId, email, nombre);
  }

  async validateUser({
    mail,
    id,
  }: IValidateUserRepository): Promise<User | null> {
    const newUser = await UserScheme.findOne({
      where: mail ? { email: mail } : { id },
    });

    if (!newUser) return null;

    return new User(newUser.id, newUser.email, newUser.nombre, newUser.clave);
  }

  async updateUser({ user }: IUpdateUserRepository): Promise<string | null> {
    const { id, mail, name } = user.values;
    console.log(id);
    const rowsAffected = await UserScheme.update(
      { nombre: name, email: mail },
      { where: { id } },
    );

    if (!rowsAffected[0]) return null;
    return id;
  }

  async deleteUser({ id }: IDeleteUserRepository): Promise<string | null> {
    const rowsAffected = await UserScheme.destroy({ where: { id } });
    if (rowsAffected === 0) return null;
    return id;
  }
}
