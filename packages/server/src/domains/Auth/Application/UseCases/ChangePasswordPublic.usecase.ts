import { AppError, IUseCase } from '@server/Application';
import { IChangePasswordPublicUsecase } from '@server/domains/Auth';
import { UserRepository } from '@server/domains/Users';
import { getCryptedPassword } from '@server/utils/bcrypt';

export class ChangePasswordPublic implements IUseCase<void> {
  constructor(private readonly usersRepository: UserRepository) {}

  async execute({
    input: { mail, newPassword, rePassword },
    requestContext,
  }: IChangePasswordPublicUsecase): Promise<void> {
    if (newPassword !== rePassword) {
      throw new AppError('Las contraseñas nuevas no coinciden');
    }

    try {
      await this.usersRepository.changePasswordPublic({
        mail,
        password: getCryptedPassword(newPassword),
        requestContext,
      });
    } catch (error) {
      throw new AppError('No se pudo cambiar la constraseña');
    }
  }
}
