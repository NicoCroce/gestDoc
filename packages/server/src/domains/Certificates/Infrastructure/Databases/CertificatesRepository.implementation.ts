import {
  Certificate,
  CertificateRepository,
  IGetCertificatesRepository,
} from '../../Domain';
import { IAddCertificateRepository } from '../../Domain/Certificate.respository';
import { CertificateTypes } from '../../Domain/CertificateTypes.entity';
import { CertificateModel } from './Certificates.model';
import { CertificatesTypesModel } from './CertificatesTypes.model';

export class CertificatesRepositoryImplementation
  implements CertificateRepository
{
  async getCertificates({
    requestContext,
  }: IGetCertificatesRepository): Promise<Certificate[]> {
    const certificates = await CertificateModel.findAll({
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
        type: CertificateTypes.create({
          id: certificate.CertificatesTypesModel.id,
          name: certificate.CertificatesTypesModel.denominacion,
        }),
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

  async addCertificate({
    requestContext,
    certificate,
  }: IAddCertificateRepository): Promise<Certificate> {
    const { startDate, endDate, type, reason, files } = certificate.values;

    try {
      const {
        id,
        fecha_inicio,
        fecha_fin,
        motivo,
        archivos,
        id_tipo_certificado,
      } = await CertificateModel.create({
        fecha_inicio: startDate,
        fecha_fin: endDate,
        motivo: reason,
        id_tipo_certificado: type.values.id,
        archivos: files,
        id_usuario: requestContext.values.userId,
      });

      const certificateType =
        await CertificatesTypesModel.findByPk(id_tipo_certificado);

      if (!certificateType) {
        throw new Error('Tipo de certificado no encontrado');
      }

      return Certificate.create({
        id,
        startDate: fecha_inicio,
        endDate: fecha_fin,
        reason: motivo,
        type: CertificateTypes.create({
          id: certificateType.id,
          name: certificateType.denominacion,
        }),
        files: archivos,
      });
    } catch (error) {
      console.error('Error inserting certificate:', error);
      throw new Error('Failed to insert certificate');
    }
  }
}
