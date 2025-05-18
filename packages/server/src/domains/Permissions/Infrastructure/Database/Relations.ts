import { UserModel } from '@server/domains/Users';
import { PermissionsModel } from './Permissions.model';
import { RolesModel } from './Roles.model';
import { Users_RolesModel } from './Users_Roles.model';

PermissionsModel.belongsToMany(RolesModel, {
  through: 'Roles_permisos',
  foreignKey: 'id_permiso',
  otherKey: 'id_rol',
});

RolesModel.belongsToMany(PermissionsModel, {
  through: 'Roles_permisos',
  foreignKey: 'id_rol',
  otherKey: 'id_permiso',
});

UserModel.belongsToMany(RolesModel, {
  through: 'Usuarios_roles',
  foreignKey: 'id_usuario',
  otherKey: 'id_rol',
});

RolesModel.belongsToMany(UserModel, {
  through: 'Usuarios_roles',
  foreignKey: 'id_rol',
  otherKey: 'id_usuario',
});

UserModel.hasMany(Users_RolesModel, {
  foreignKey: 'id_usuario',
  as: 'UsersRoles',
});

Users_RolesModel.belongsTo(UserModel, {
  foreignKey: 'id_usuario',
  as: 'User',
});
