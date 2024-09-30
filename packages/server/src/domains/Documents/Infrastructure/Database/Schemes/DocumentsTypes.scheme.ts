import { sequelize } from '@server/Infrastructure';
import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

export class Sis_tipo_documentos extends Model<
  InferAttributes<Sis_tipo_documentos>,
  InferCreationAttributes<Sis_tipo_documentos>
> {
  declare id: CreationOptional<number>;
  declare denominacion: string;
  declare requiere_firma: boolean;

  // Timestamps
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare readonly deletedAt: Date;
}

Sis_tipo_documentos.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    denominacion: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    requiere_firma: {
      type: DataTypes.BOOLEAN,
      defaultValue: 0,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'Sis_tipo_documentos',
    paranoid: true,
    timestamps: true,
    tableName: 'Sis_tipo_documentos',
  },
);
