import { Certificados } from './Certificates.model';
import { CertificatesTypesModel } from './CertificatesTypes.model';

CertificatesTypesModel.hasMany(Certificados, {
  foreignKey: 'id_tipo_certificado',
});
Certificados.belongsTo(CertificatesTypesModel, {
  foreignKey: 'id_tipo_certificado',
});
