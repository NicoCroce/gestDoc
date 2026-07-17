import { AppError, IUseCase, RequestContext } from '@server/Application';
import { CertificateRepository } from '../../Domain/Certificate.respository';
import { IDeleteCertificate } from '../certificates.types';
import { GetRoleByUser } from '@server/domains/Permissions/Application/UseCases/GetRoleByUser.usecase';

export class DeleteCertificate implements IUseCase<void> {
  constructor(
    private readonly certificatesRepository: CertificateRepository,
    private readonly getRoleByUser: GetRoleByUser,
  ) {}

  async execute({ input, requestContext }: IDeleteCertificate): Promise<void> {
    const certificate = await this.certificatesRepository.getCertificate({
      id: input.id,
      requestContext,
    });

    if (!certificate) {
      throw new AppError('Certificado no encontrado', 404);
    }

    const isAdmin = await this.checkAdmin(requestContext);

    if (!isAdmin) {
      if (certificate.userId !== requestContext.values.userId) {
        throw new AppError(
          'No tienes permiso para eliminar este certificado',
          403,
        );
      }

      try {
        certificate.assertOwnerCanDelete();
      } catch (error) {
        throw new AppError(
          error instanceof Error
            ? error.message
            : 'No se puede eliminar el certificado',
          403,
        );
      }
    }

    await this.certificatesRepository.deleteCertificate({
      id: input.id,
      requestContext,
    });
  }

  private async checkAdmin(requestContext: RequestContext): Promise<boolean> {
    try {
      const roleName = await this.getRoleByUser.execute({
        input: requestContext.values.userId,
        requestContext,
      });
      return roleName === 'Full Admin' || roleName === 'admin';
    } catch {
      return false;
    }
  }
}
