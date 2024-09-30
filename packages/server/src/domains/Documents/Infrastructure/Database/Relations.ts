import { UserScheme } from '@server/domains/Users';
import { Documentos, Sis_tipo_documentos } from './Schemes';

Sis_tipo_documentos.hasMany(Documentos, { foreignKey: 'tipo' });
Documentos.belongsTo(Sis_tipo_documentos, { foreignKey: 'tipo' });

Documentos.hasMany(UserScheme, { foreignKey: 'Usuario_id' });
UserScheme.belongsTo(Documentos, { foreignKey: 'Usuario_id' });
