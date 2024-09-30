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
    const document = await Documentos.findOne({
      where: { id },
    });
    if (!document) return null;
    return Document.create({
      id,
      title: document.titulo,
      file: document.archivo,
      signed: document.firmado,
      type: document.Sis_tipo_documento.denominacion,
      agreedment: document.firma_bajo_acuerdo,
      requireSign: document.Sis_tipo_documento.requiere_firma,
      uploadDate: document.fecha_de_subida,
      validationSign: document.validacion_de_firma,
      view: document.visualizado,
    });
  }

  async viewDocument({
    requestContext,
    id,
  }: IViewDocumentRepository): Promise<number | null> {
    console.log('Hacer algo con userID', requestContext);
    const rowsAffected = await Documentos.update(
      { visualizado: new Date() },
      { where: { id } },
    );

    if (!id || !rowsAffected[0]) return null;
    return id;
  }

  async signDocument({
    requestContext,
    id,
    validationSign,
    agreement,
  }: ISignDocumentRepository): Promise<number | null> {
    console.log('Hacer algo con userID', requestContext);
    const rowsAffected = await Documentos.update(
      {
        firmado: new Date(),
        validacion_de_firma: validationSign,
        firma_bajo_acuerdo: agreement,
      },
      { where: { id } },
    );

    if (!id || !rowsAffected[0]) return null;

    return id;
  }
}
