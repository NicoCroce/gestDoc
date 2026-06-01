import { IRequestContext } from '@server/Application';
import { User } from './User.entity';
export interface IGetUserRepository extends IRequestContext {
  id: number;
}
export interface IValidateUserRepository extends IRequestContext {
  mail?: string;
  id?: number;
}

export interface IChangePasswordRepository extends IRequestContext {
  password: string;
}
export interface IChangePasswordPublicRepository extends IRequestContext {
  mail: string;
  password: string;
}

export interface IGetEmailsByUsersIdRepository extends IRequestContext {
  userIds: number[];
}

export interface IRenewPasswordRepository extends IRequestContext {
  mail: string;
  password: string;
}

export interface UserRepository {
  getUser(params: IGetUserRepository): Promise<User | null>;
  validateUser(params: IValidateUserRepository): Promise<User | null>;
  changePassword(params: IChangePasswordRepository): Promise<void | null>;
  getEmailsByUsersId(params: IGetEmailsByUsersIdRepository): Promise<string[]>;
  // No queda expuesto por el servicio de Users. Solo se utiliza por medio de Auth.
  renewPassword(params: IRenewPasswordRepository): Promise<void | null>;
  // ---
}
