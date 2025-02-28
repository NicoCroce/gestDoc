import { IUseCase } from '@server/Application';
import { IGetCertificateTypes } from '../Certificate.interfaces';
import { CertificateRepository } from '../Certificate.respository';
import { CertificateTypes } from '../CertificateTypes.entity';

export class GetCertificateTypes implements IUseCase<CertificateTypes[]> {
  constructor(private readonly certificatesRepository: CertificateRepository) {}

  async execute({
    requestContext,
  }: IGetCertificateTypes): Promise<CertificateTypes[]> {
    const certificateTypes =
      await this.certificatesRepository.getCertificatesTypes({
        requestContext,
      });

    return certificateTypes;
  }
}
