import { axios } from '@server/utils/axios';
import { AuthRepository, IRestorePasswordRepository } from '../../Domain';

export class AuthRepositoryImplementation implements AuthRepository {
  async restorePassword({
    mail,
    requestContext,
  }: IRestorePasswordRepository): Promise<void> {
    await axios.post(
      '/nuevousuario/sendReestablecer',
      { email: mail },
      {
        headers: {
          ...(requestContext?.values?.xAppClient && {
            'x-app-client': requestContext.values.xAppClient,
          }),
        },
      },
    );
  }
}
