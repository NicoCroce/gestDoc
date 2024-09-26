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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getUsers({ requestContext }: IGetUsersRepository): Promise<User[]> {
    const users = await UserScheme.findAll({
      attributes: ['id', 'email', 'nombre'],
    });
    return users.map((user) => new User(user.id, user.email, user.nombre));
  }

  async registerUser({
    user,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    requestContext,
  }: IRegisterUserRepository): Promise<User> {
    const newUser = await UserScheme.create({
      nombre: user.mail,
      apellido: '',
      clave: user.password!,
      email: user.mail,
    });
    return new User(newUser.id, newUser.email, newUser.nombre);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getUser({ id }: IGetUserRepository): Promise<User | null> {
    throw new Error('Method not implemented.');
  }

  async validateUser({
    mail,
    id,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    requestContext,
  }: IValidateUserRepository): Promise<User | null> {
    const newUser = await UserScheme.findOne({
      where: mail ? { email: mail } : { id },
    });

    if (!newUser) return null;

    return new User(newUser.id, newUser.email, newUser.nombre, newUser.clave);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updateUser(_params: IUpdateUserRepository): Promise<User | null> {
    throw new Error('Method not implemented.');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  deleteUser(_params: IDeleteUserRepository): Promise<User | null> {
    throw new Error('Method not implemented.');
  }
}
