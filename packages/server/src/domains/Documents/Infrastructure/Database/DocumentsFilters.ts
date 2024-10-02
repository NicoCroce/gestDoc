import { Op, WhereOptions } from 'sequelize';
import { Documentos } from './';
import { Literal } from 'sequelize/lib/utils';
import { IGetDocumentsRepository } from '../../Domain';
import { DocumentsTypesModel } from '@server/domains/DocumentsTypes/Infraestructure';

export const DocumentsFilters = (
  filters: IGetDocumentsRepository['filters'],
) => {
  const whereCondition: WhereOptions<Documentos> = {};
  const whereConditionSisTipoDocumentos: WhereOptions<DocumentsTypesModel> = {};

  if (filters.title) whereCondition.titulo = { [Op.substring]: filters.title };

  if (filters.signed)
    whereCondition.firmado = { [Op.not]: null as unknown as Literal };

  if (filters.view !== null)
    whereCondition.visualizado = filters.view === filters.view;

  if (filters.type)
    whereConditionSisTipoDocumentos.denominacion = { [Op.eq]: filters.type };

  if (filters.requireSign !== null)
    whereConditionSisTipoDocumentos.requiere_firma =
      filters.requireSign || false;

  const filterValidated: WhereOptions<Documentos> = filters.validated
    ? ({
        [Op.or]: [
          {
            firmado: {
              [Op.not]: null, // Document signed
            },
          },
          {
            [Op.and]: [
              { '$DocumentsTypesModel.requiere_firma$': false }, // Doesn't require signature
              { visualizado: { [Op.not]: null } }, // And has been viewed
            ],
          },
        ],
      } as WhereOptions<Documentos>)
    : filters.validated === false
      ? ({
          [Op.or]: [
            {
              [Op.and]: [
                { '$DocumentsTypesModel.requiere_firma$': true },
                { firmado: { [Op.is]: null } },
              ],
            },
            {
              [Op.and]: [
                { '$DocumentsTypesModel.requiere_firma$': false },
                { visualizado: { [Op.is]: null } },
              ],
            },
          ],
        } as WhereOptions<Documentos>)
      : {};

  return {
    whereCondition,
    whereConditionSisTipoDocumentos,
    filterValidated,
  };
};
