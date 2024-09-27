import { sequelize } from '@server/Infrastructure';
import { DataTypes, Model } from 'sequelize';

interface UserAttributes {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  clave: string;
  imagen?: string;
  telefono?: string;
  direccion?: string;
  localidad?: string;
  fecha_nac?: string;
  id_propietario?: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

type UserCreationAttributes = Omit<UserAttributes, 'id'>;

export class UserScheme
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  declare id: number;
  declare nombre: string;
  declare apellido: string;
  declare email: string;
  declare clave: string;
  declare imagen?: string;
  declare telefono?: string;
  declare direccion?: string;
  declare localidad?: string;
  declare fecha_nac?: string;
  declare id_propietario?: number;
  declare createdAt?: Date;
  declare updatedAt?: Date;
  declare deletedAt?: Date;
}

UserScheme.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    nombre: DataTypes.STRING,
    apellido: DataTypes.STRING,
    email: DataTypes.STRING,
    clave: DataTypes.STRING,
    imagen: DataTypes.STRING,

    telefono: DataTypes.STRING,
    direccion: DataTypes.STRING,
    localidad: DataTypes.STRING,
    fecha_nac: DataTypes.STRING,
    id_propietario: DataTypes.BIGINT,

    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  },
  {
    sequelize,
    paranoid: true,
    modelName: 'User',
    timestamps: true,
    tableName: 'Usuarios',
  },
);
