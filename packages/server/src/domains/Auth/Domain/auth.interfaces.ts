import { IRequestContext } from '@server/Application';
import { User } from '@server/domains/Users';

export interface Ilogin extends IRequestContext {
  input: {
    mail: string;
    password: string;
  };
}

export interface IValidateUserPassword extends IRequestContext {
  input: {
    mail?: string;
    id?: number;
    password: string;
  };
}

export interface IRestorePassword extends IRequestContext {
  input: string; // mail
}

export interface IExecuteResponse {
  token: string;
  user: User;
}

export interface IChangePasswordPublic extends IRequestContext {
  input: { token: string; newPassword: string; rePassword: string };
}

export interface IChangePasswordPublicUsecase extends IRequestContext {
  input: { mail: string; newPassword: string; rePassword: string };
}
