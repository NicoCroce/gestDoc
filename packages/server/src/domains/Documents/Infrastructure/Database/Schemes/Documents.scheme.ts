import { sequelize } from '@server/Infrastructure';
import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  NonAttribute,
} from 'sequelize';
import { Sis_tipo_documentos } from './DocumentsTypes.scheme';

export class Documentos extends Model<
  InferAttributes<Documentos>,
  InferCreationAttributes<Documentos>
> {
  declare id: CreationOptional<number>;
  declare tipo: number;
  declare Usuario_id: number;
  declare titulo: string;
  declare archivo: string;
  declare fecha_de_subida: Date;
  declare firmado: CreationOptional<Date>;
  declare visualizado: CreationOptional<Date>;
  declare validacion_de_firma: CreationOptional<string>;
  declare firma_bajo_acuerdo: CreationOptional<boolean>;

  // Timestamps
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
  declare readonly deletedAt: CreationOptional<Date>;

  // Relation
  declare readonly Sis_tipo_documento: NonAttribute<
    InferAttributes<Sis_tipo_documentos>
  >;
}

Documentos.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    tipo: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    Usuario_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    fecha_de_subida: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    titulo: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    archivo: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    firmado: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    visualizado: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    validacion_de_firma: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    firma_bajo_acuerdo: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },

    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'Documentos',
    paranoid: true,
    timestamps: true,
    tableName: 'Documentos',
  },
);
