import { UserModel } from '@server/domains/Users';
import {
  Certificate,
  CertificateRepository,
  IGetCertificatesRepository,
} from '../../Domain';
import {
  IAddCertificateRepository,
  IAppendImagesRepository,
  IGetAllCompanyCertificatesRepositoryResponse,
} from '../../Domain/Certificate.respository';
import { CertificateTypes } from '../../Domain/CertificateTypes.entity';
import { CertificateModel } from './Certificates.model';
import { CertificatesTypesModel } from './CertificatesTypes.model';
import { CertificatesFilters } from './CertificatesFilters';

export class CertificatesRepositoryImplementation
  implements CertificateRepository
{
  async appendImages({
    requestContext: _,
    certificateId,
    files,
  }: IAppendImagesRepository): Promise<Certificate> {
    try {
      const certificate = await CertificateModel.findByPk(certificateId);

      if (!certificate) {
        throw new Error('Certificate not found');
      }

      const updatedFiles = [...(certificate.archivos || []), ...files];

      await certificate.update({ archivos: updatedFiles });

      const certificateType = await CertificatesTypesModel.findByPk(
        certificate.id_tipo_certificado,
      );

      if (!certificateType) {
        throw new Error('Certificate type not found');
      }

      return Certificate.create({
        id: certificate.id,
        startDate: certificate.fecha_inicio,
        endDate: certificate.fecha_fin,
        reason: certificate.motivo,
        type: CertificateTypes.create({
          id: certificateType.id,
          name: certificateType.denominacion,
        }),
        files: updatedFiles,
      });
    } catch (error) {
      console.error('Error appending images to certificate:', error);
      throw new Error('Failed to append images to certificate');
    }
  }

  async getCertificates({
    filters,
    requestContext,
  }: IGetCertificatesRepository): Promise<Certificate[]> {
    const { whereConditionUsers, whereConditionCertificates } =
      CertificatesFilters(filters);
    const certificates = await CertificateModel.findAll({
      where: {
        id_usuario: requestContext.values.userId,
        ...whereConditionCertificates,
      },
      include: [
        {
          model: CertificatesTypesModel,
        },
        {
          model: UserModel,
          as: 'User',
          where: whereConditionUsers,
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

  async getAllCompanyCertificates({
    requestContext,
  }: IGetCertificatesRepository): Promise<
    IGetAllCompanyCertificatesRepositoryResponse[]
  > {
    const certificates = await CertificateModel.findAll({
      include: [
        {
          model: UserModel,
          as: 'User',
          where: { id_propietario: requestContext.values.ownerId },
          attributes: ['id', 'nombre', 'apellido'], // Atributos necesarios para la agrupación y ordenación
        },
        {
          model: CertificatesTypesModel,
        },
      ],
      order: [
        [{ model: UserModel, as: 'User' }, 'nombre', 'ASC'],
        [{ model: UserModel, as: 'User' }, 'apellido', 'ASC'],
      ],
    });

    return certificates.map((certificate) => {
      const {
        id,
        fecha_inicio,
        fecha_fin,
        motivo,
        archivos,
        id_usuario,
        CertificatesTypesModel,
        User,
      } = certificate;

      return {
        id,
        startDate: fecha_inicio,
        endDate: fecha_fin,
        reason: motivo,
        type: CertificateTypes.create({
          id: CertificatesTypesModel.id,
          name: CertificatesTypesModel.denominacion,
        }),
        files: archivos,
        userId: id_usuario,
        userName: `${User.nombre} ${User.apellido}`,
      };
    });
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
    const { startDate, endDate, type, reason } = certificate.values;

    try {
      const { id, fecha_inicio, fecha_fin, motivo, id_tipo_certificado } =
        await CertificateModel.create({
          fecha_inicio: startDate,
          fecha_fin: endDate,
          motivo: reason,
          id_tipo_certificado: type.values.id,
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
      });
    } catch (error) {
      console.error('Error inserting certificate:', error);
      throw new Error('Failed to insert certificate');
    }
  }
}
