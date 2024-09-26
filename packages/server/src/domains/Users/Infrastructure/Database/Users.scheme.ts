import { sequelize } from '@server/Infrastructure';
import { DataTypes, Model } from 'sequelize';

export class UserScheme extends Model {
  public id!: string;
  public nombre!: string;
  public apellido!: string;
  public email!: string;
  public clave!: string;
  public imagen!: string;
  public telefono!: string;
  public direccion!: string;
  public localidad!: string;
  public fecha_nac!: string;
  public id_propietario!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
  public deletedAt!: Date;
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
