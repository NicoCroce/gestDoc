import { IUseCase } from '@server/Application';
import { CertificateRepository } from '../Certificate.respository';
import {
  IGetCertificates,
  IGetCertificatesResponse,
} from '../Certificate.interfaces';

export class GetCertificates implements IUseCase<IGetCertificatesResponse> {
  constructor(private readonly certificatesRepository: CertificateRepository) {}

  async execute({
    requestContext,
  }: IGetCertificates): Promise<IGetCertificatesResponse> {
    const certificates = await this.certificatesRepository.getCertificates({
      requestContext,
    });

    // recibe todos los certificados ordenados for fecha
    const orderedCertificates = certificates.reduce((response, certificate) => {
      const year = new Date(certificate.values.startDate).getFullYear();

      response[year] = response[year] ?? [];
      response[year].push(certificate);

      return response;
    }, {} as IGetCertificatesResponse);

    return orderedCertificates;
  }
}
