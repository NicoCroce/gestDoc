import { endOfDay, startOfDay } from '@server/Application';
import { Op, WhereOptions } from 'sequelize';
import { IGetCertificatesRepository } from '../../Domain';
import { CertificateModel } from './Certificates.model';
import { UserModel } from '@server/domains/Users';

export const CertificatesFilters = (
  filters: IGetCertificatesRepository['filters'],
) => {
  type TWhereConditionCertificates = WhereOptions<CertificateModel>;
  const whereConditionCertificates: WhereOptions<CertificateModel> = {};

  // Condiciones para el modelo de usuarios
  type TWhereConditionUsers = WhereOptions<UserModel>;
  const whereConditionUsers: TWhereConditionUsers = {};

  // Si hay un filtro de empleado, lo aplicamos a los atributos nombre o apellido del usuario
  if (filters?.employee)
    whereConditionUsers[Op.or as keyof TWhereConditionUsers] = [
      { nombre: { [Op.substring]: filters.employee } },
      { apellido: { [Op.substring]: filters.employee } },
    ];

  if (filters?.type)
    whereConditionCertificates.id_tipo_certificado = filters.type;

  // Si hay un filtro de fecha, buscamos certificados que incluyan esa fecha
  if (filters?.date) {
    const dayStart = startOfDay(filters.date);
    const dayEnd = endOfDay(filters.date);

    whereConditionCertificates[Op.and as keyof TWhereConditionCertificates] = [
      { fecha_inicio: { [Op.lte]: dayEnd } },
      { fecha_fin: { [Op.gte]: dayStart } },
    ];
  }

  return {
    whereConditionCertificates,
    whereConditionUsers,
  };
};
