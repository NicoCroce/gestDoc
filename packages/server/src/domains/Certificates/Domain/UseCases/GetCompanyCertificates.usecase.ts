import { AppError, IUseCase } from '@server/Application';
import { CertificateRepository } from '../Certificate.respository';
import {
  IGetCertificatesByCompanyResponse,
  IGetCertificatesCompany,
} from '../Certificate.interfaces';
import { Certificate } from '../Certificate.entity';

export class GetCertificatesByCompany
  implements IUseCase<IGetCertificatesByCompanyResponse>
{
  constructor(private readonly certificatesRepository: CertificateRepository) {}

  async execute({
    requestContext,
  }: IGetCertificatesCompany): Promise<IGetCertificatesByCompanyResponse> {
    const certificates =
      await this.certificatesRepository.getAllCompanyCertificates({
        requestContext,
      });

    if (!certificates) {
      throw new AppError('Error al obtener los documentos');
    }

    const certificatesByUser = certificates.reduce(
      (res: IGetCertificatesByCompanyResponse, cert) => {
        const {
          userId,
          id,
          endDate,
          reason,
          startDate,
          type,
          userName,
          files,
        } = cert;
        if (!userId) return res;

        if (!res[userId]) {
          res[userId] = {
            user: userName,
            certificates: [],
          };
        }

        res[userId].certificates.push(
          Certificate.create({
            id,
            startDate,
            endDate,
            reason,
            type,
            userId,
            files,
          }),
        );

        return res;
      },
      {},
    );

    return certificatesByUser;
  }
}
