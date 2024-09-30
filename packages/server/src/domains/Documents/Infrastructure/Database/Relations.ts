import { UserScheme } from '@server/domains/Users';
import { Documentos, Sis_tipo_documentos } from './Schemes';

Sis_tipo_documentos.hasMany(Documentos, { foreignKey: 'tipo' });
Documentos.belongsTo(Sis_tipo_documentos, { foreignKey: 'tipo' });

UserScheme.hasMany(Documentos, { foreignKey: 'Usuario_id' });
Documentos.belongsTo(UserScheme, { foreignKey: 'Usuario_id' });
