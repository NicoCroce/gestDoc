import { AppError, IUseCase } from '@server/Application';
import { CertificateRepository } from '../Certificate.respository';
import { IAddCertificate } from '../Certificate.interfaces';
import { Certificate } from '../Certificate.entity';
import { CertificateTypes } from '../CertificateTypes.entity';

export class AddCertificate implements IUseCase<Certificate> {
  constructor(private readonly certificatesRepository: CertificateRepository) {}

  async execute({
    input: { type, startDate, endDate, files, reason },
    requestContext,
  }: IAddCertificate): Promise<Certificate> {
    try {
      const certificte = await this.certificatesRepository.addCertificate({
        certificate: Certificate.create({
          type: CertificateTypes.create({ id: type }),
          startDate,
          endDate,
          files,
          reason,
        }),
        requestContext,
      });

      return certificte;
    } catch {
      throw new AppError('El certificado no fue agregado');
    }
  }
}
