import { sequelize } from '@server/Infrastructure';
import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  NonAttribute,
} from 'sequelize';
import { CertificatesTypesModel } from './CertificatesTypes.model';

export class CertificateModel extends Model<
  InferAttributes<CertificateModel>,
  InferCreationAttributes<CertificateModel>
> {
  declare id: CreationOptional<number>;
  declare id_usuario: number;
  declare fecha_inicio: Date;
  declare fecha_fin: Date;

  declare motivo: string;
  declare id_tipo_certificado: number;
  declare archivos: string[];

  // Timestamps
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
  declare readonly deletedAt: CreationOptional<Date>;

  // Relation
  declare readonly CertificatesTypesModel: NonAttribute<
    InferAttributes<CertificatesTypesModel>
  >;
}

CertificateModel.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fecha_inicio: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    fecha_fin: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    motivo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    id_tipo_certificado: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    archivos: {
      type: DataTypes.JSON,
      allowNull: false,
    },

    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'CertificateModel',
    paranoid: true,
    timestamps: true,
    tableName: 'Certificados',
  },
);
