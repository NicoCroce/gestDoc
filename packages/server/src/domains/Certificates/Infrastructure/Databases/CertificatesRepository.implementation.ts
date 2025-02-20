import {
  Certificate,
  CertificateRepository,
  IGetCertificatesRepository,
} from '../../Domain';
import { CertificateTypes } from '../../Domain/CertificateTypes.entity';
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

  async getCertificatesTypes({
    requestContext: _,
  }: IGetCertificatesRepository): Promise<CertificateTypes[]> {
    const certificatesTypes = await CertificatesTypesModel.findAll();

    return certificatesTypes.map((certificateType) =>
      CertificateTypes.create({
        id: certificateType.id,
        name: certificateType.denominacion,
        description: certificateType.descripcion,
      }),
    );
  }
}
