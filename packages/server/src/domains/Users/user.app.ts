import { asClass } from 'awilix';
import {
  UsersController,
  UsersRepositoryImplementation,
} from './Infrastructure';
import {
  ChangePassword,
  GetEmailsByUsersId,
  ValidateUserPassword,
  RenewPassword,
  UsersService,
  GetUser,
} from './Application';
import { container } from '@server/utils/Container';

export const userApp = {
  usersRepository: asClass(UsersRepositoryImplementation),
  usersService: asClass(UsersService),
  usersController: asClass(UsersController),
  _changePassword: asClass(ChangePassword),
  _getUser: asClass(GetUser),

  _getEmailsByUsersId: asClass(GetEmailsByUsersId),
  _renewPassword: asClass(RenewPassword),
  _validateUserPassword: asClass(ValidateUserPassword),
};

export const usersController = () =>
  container.resolve<UsersController>('usersController');
