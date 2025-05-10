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
  IGetStatisticsCertificatesRepository,
  IGetStatisticsCertificatesRepositoryResponse,
} from '../../Domain/Certificate.respository';
import { CertificateTypes } from '../../Domain/CertificateTypes.entity';
import { CertificateModel } from './Certificates.model';
import { CertificatesTypesModel } from './CertificatesTypes.model';
import { CertificatesFilters } from './CertificatesFilters';
import { Op } from 'sequelize';
import { sequelize } from '@server/Infrastructure';

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
    filters,
    requestContext,
  }: IGetCertificatesRepository): Promise<
    IGetAllCompanyCertificatesRepositoryResponse[]
  > {
    const { whereConditionUsers, whereConditionCertificates } =
      CertificatesFilters(filters);

    const certificates = await CertificateModel.findAll({
      where: { ...whereConditionCertificates },
      include: [
        {
          model: UserModel,
          as: 'User',
          where: {
            id_propietario: requestContext.values.ownerId,
            ...whereConditionUsers,
          },
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

  async getStatisticsCertificates({
    requestContext,
  }: IGetStatisticsCertificatesRepository): Promise<IGetStatisticsCertificatesRepositoryResponse> {
    const ownerId = requestContext.values.ownerId;

    const includeOwner = {
      model: UserModel,
      as: 'User',
      required: true,
      where: {
        id_propietario: ownerId,
      },
    };

    const consultDate = new Date();
    consultDate.setHours(12, 0, 0, 0); // Mediodía para evitar problemas con zonas horarias

    const totalCertificates = await CertificateModel.count({
      include: [includeOwner],
    });

    const activesCertificates = await CertificateModel.count({
      where: [
        { fecha_inicio: { [Op.lte]: consultDate } }, // fecha_inicio <= fecha_consultada
        { fecha_fin: { [Op.gte]: consultDate } }, // fecha_fin >= fecha_consultada
      ],
      include: [includeOwner],
    });

    const allCertificatesTypes = await CertificateModel.findAll({
      attributes: [
        'id_tipo_certificado',
        [sequelize.fn('COUNT', sequelize.col('CertificateModel.id')), 'count'], // Contar certificados por tipo
      ],
      include: [
        {
          model: CertificatesTypesModel,
          attributes: ['id', 'denominacion'], // Atributos del tipo de certificado
        },
        includeOwner, // Relación con el usuario propietario
      ],
      group: [
        'CertificateModel.id_tipo_certificado', // Incluir id_tipo_certificado en el GROUP BY
        'CertificatesTypesModel.id',
        'CertificatesTypesModel.denominacion',
        'User.id',
        'User.nombre',
        'User.apellido',
      ], // Incluir todas las columnas del SELECT en el GROUP BY
    });

    const certificatesByEmployee = await CertificateModel.findAll({
      attributes: [
        'id_usuario', // Identificador del usuario
        [sequelize.fn('COUNT', sequelize.col('CertificateModel.id')), 'count'], // Contar certificados por usuario
      ],
      include: [
        {
          model: UserModel,
          as: 'User',
          required: true,
          where: {
            id_propietario: ownerId,
          },
          attributes: ['id', 'nombre', 'apellido'], // Atributos del usuario
        },
      ],
      group: ['id_usuario', 'User.id', 'User.nombre', 'User.apellido'], // Agrupar por usuario
    });

    const allCertificatesTypesResponse = allCertificatesTypes.map(
      (certificate) => ({
        name: certificate.CertificatesTypesModel.denominacion,
        count: certificate.get('count') as number,
      }),
    );

    const certificatesByEmployeeResponse = certificatesByEmployee.map(
      (certificate) => ({
        user: `${certificate.User.nombre} ${certificate.User.apellido}`,
        count: certificate.get('count') as number,
      }),
    );

    return {
      total: totalCertificates,
      actives: activesCertificates,
      types: allCertificatesTypesResponse,
      employees: certificatesByEmployeeResponse,
    };
  }
}
