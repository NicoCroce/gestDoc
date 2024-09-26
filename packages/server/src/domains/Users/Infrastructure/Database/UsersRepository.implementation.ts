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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  registerUser(_params: IRegisterUserRepository): Promise<User> {
    throw new Error('Method not implemented.');
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getUser({ id }: IGetUserRepository): Promise<User | null> {
    throw new Error('Method not implemented.');
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validateUser(_params: IValidateUserRepository): Promise<User | null> {
    throw new Error('Method not implemented.');
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
