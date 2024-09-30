import {
  Document,
  DocumentRepository,
  IGetDocumentRepository,
  IGetDocumentsRepository,
  ISignDocumentRepository,
  IViewDocumentRepository,
} from '../../Domain';
import { DocumentsSchemeLocal } from './Documents.scheme.local';
import { DocumentsFilters } from './DocumentsFilters';
import { Documentos, Sis_tipo_documentos } from './Schemes';

export class DocumentsRepositoryImplementation implements DocumentRepository {
  private readonly DB = new DocumentsSchemeLocal();

  async getDocuments({
    filters,
    requestContext,
  }: IGetDocumentsRepository): Promise<Document[]> {
    const { whereCondition, filterValidated, whereConditionSisTipoDocumentos } =
      DocumentsFilters(filters);

    const documents = await Documentos.findAll({
      attributes: [
        'id',
        'fecha_de_subida',
        'titulo',
        'archivo',
        'firmado',
        'visualizado',
        'validacion_de_firma',
        'firma_bajo_acuerdo',
      ],
      where: {
        Usuario_id: requestContext.values.userId,
        ...whereCondition,
        ...filterValidated,
      },
      include: [
        {
          model: Sis_tipo_documentos,
          attributes: ['denominacion', 'requiere_firma'],
          where: whereConditionSisTipoDocumentos,
        },
      ],
    });

    return documents?.map((document) =>
      Document.create({
        id: document.id,
        title: document.titulo,
        uploadDate: document.fecha_de_subida,
        file: document.archivo,
        requireSign: document.Sis_tipo_documento?.requiere_firma || false,
        signed: document.firmado,
        agreedment: document.firma_bajo_acuerdo,
        type: document.Sis_tipo_documento.denominacion,
        validationSign: document.validacion_de_firma,
        view: document.visualizado,
      }),
    );
  }

  async getDocument({
    id,
    requestContext,
  }: IGetDocumentRepository): Promise<Document | null> {
    console.log('Hacer algo con userID', requestContext);
    const document = await this.DB.getDocument(id);
    if (!document) return null;
    return Document.create(document);
  }

  viewDocument({
    requestContext,
    id,
  }: IViewDocumentRepository): Promise<number | null> {
    console.log('Hacer algo con userID', requestContext);
    return this.DB.viewDocument(id);
  }

  signDocument({
    requestContext,
    id,
    validationSign,
    agreement,
  }: ISignDocumentRepository): Promise<number | null> {
    console.log('Hacer algo con userID', requestContext);
    return this.DB.signDocument(id, agreement, validationSign);
  }
}

/* const whereCondition: WhereOptions<Documentos> = {
      ...(filters.signed
        ? ({
            firmado: {
              [Op.not]: null,
            },
          } as WhereOptions<Documentos>)
        : {}),
      ...(filters.title
        ? {
            titulo: {
              [Op.substring]: filters.title,
            },
          }
        : {}),
    }; */

// adentro de la función

/* where: filters.signed
        ? ({
            firmado: {
              [Op.not]: null,
            },
          } as WhereOptions<Documentos>)
        : {}, */
/* where: filters.title
        ? {
            titulo: {
              [Op.substring]: filters.title,
            },
          }
        : {}, */
