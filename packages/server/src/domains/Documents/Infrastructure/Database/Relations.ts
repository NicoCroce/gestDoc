import { UserScheme } from '@server/domains/Users';
import { Documentos } from './';
import { DocumentsTypesModel } from '@server/domains/DocumentsTypes/Infraestructure';

DocumentsTypesModel.hasMany(Documentos, { foreignKey: 'tipo' });
Documentos.belongsTo(DocumentsTypesModel, { foreignKey: 'tipo' });

UserScheme.hasMany(Documentos, { foreignKey: 'Usuario_id' });
Documentos.belongsTo(UserScheme, { foreignKey: 'Usuario_id' });
