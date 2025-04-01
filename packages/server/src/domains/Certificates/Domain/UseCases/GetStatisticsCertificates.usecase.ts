import { AppError, IUseCase } from '@server/Application';
import {
  IGetStatisticsCertificates,
  IGetStatisticsCertificatesResponse,
} from '../Certificate.interfaces';
import { CertificateRepository } from '../Certificate.respository';

export class GetStatisticsCertificates
  implements IUseCase<IGetStatisticsCertificatesResponse>
{
  constructor(private readonly certificatesRepository: CertificateRepository) {}

  async execute({
    requestContext,
  }: IGetStatisticsCertificates): Promise<IGetStatisticsCertificatesResponse> {
    try {
      return await this.certificatesRepository.getStatisticsCertificates({
        requestContext,
      });
    } catch (error) {
      throw new AppError(`Error en estadísticas para certificados: ${error}`);
    }
  }
}
