import {
  Certificate,
  CertificateRepository,
  IGetCertificatesRepository,
} from '../../Domain';
import { Certificados } from './Certificates.model';
import { CertificatesTypesModel } from './CertificatesTypes.model';

export class CertificatesRepositoryImplementation
  implements CertificateRepository
{
  async getCertificates({
    requestContext,
  }: IGetCertificatesRepository): Promise<Certificate[]> {
    const certificates = await Certificados.findAll({
      where: { id_usuario: requestContext.values.userId },
      include: [
        {
          model: CertificatesTypesModel,
        },
      ],
    });

    return certificates.map((certificate) =>
      Certificate.create({
        id: certificate.id,
        startDate: certificate.fecha_inicio,
        endDate: certificate.fecha_fin,
        reason: certificate.motivo,
        type: certificate.CertificatesTypesModel.denominacion,
        files: certificate.archivos,
      }),
    );
  }
}
