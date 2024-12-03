import { executeUseCase } from '@server/Application';
import { ChangePasswordPublic, Login } from '../Domain';
import {
  IChangePasswordPublic,
  IExecuteResponse,
  Ilogin,
  IRestorePassword,
} from '../Domain/auth.interfaces';
import { RestorePassword } from '../Domain/UseCases/RestorePassword.usecase';
import { TRPCError } from '@trpc/server';
import { verifyToken } from '@server/utils/JWT';

export class AuthService {
  constructor(
    private readonly _login: Login,
    private readonly _restorePassword: RestorePassword,
    private readonly _changePasswordPublic: ChangePasswordPublic,
  ) {}

  async login({ input, requestContext }: Ilogin): Promise<IExecuteResponse> {
    return executeUseCase({
      useCase: this._login,
      input,
      requestContext,
      inputLog: {
        mail: input.mail,
      },
    });
  }

  async restorePassword({
    input,
    requestContext,
  }: IRestorePassword): Promise<void> {
    return executeUseCase({
      useCase: this._restorePassword,
      input,
      requestContext,
    });
  }

  async changePasswordPublic({
    input,
    requestContext,
  }: IChangePasswordPublic): Promise<void> {
    const { token, newPassword, rePassword } = input;

    if (!token) {
      throw new TRPCError({
        message: 'Token not provided',
        code: 'UNAUTHORIZED',
      });
    }

    let dataToken;

    try {
      dataToken = (await verifyToken(token)) as { email: string };
    } catch {
      throw new TRPCError({
        message: 'Token error',
        code: 'UNAUTHORIZED',
      });
    }

    return executeUseCase({
      useCase: this._changePasswordPublic,
      input: { mail: dataToken.email, newPassword, rePassword },
      requestContext,
    });
  }
}
