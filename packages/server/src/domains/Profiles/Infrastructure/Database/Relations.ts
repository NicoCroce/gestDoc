import { OwnersysModel } from '@server/domains/Ownersys';
import { ProfileModel } from './Profile.model';

OwnersysModel.hasMany(ProfileModel, { foreignKey: 'id_propietario' });
ProfileModel.belongsTo(OwnersysModel, { foreignKey: 'id_propietario' });
