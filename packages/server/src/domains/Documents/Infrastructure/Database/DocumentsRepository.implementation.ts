import {
  Document,
  DocumentRepository,
  IGetDocumentRepository,
  IGetDocumentsByCompanyRepository,
  IGetDocumentsRepository,
  IGetStatisticsDocumentsRepository,
  IGetStatisticsDocumentsResponseRepository,
  ISignDocumentRepository,
  IViewDocumentRepository,
} from '../../Domain';
import { DocumentsFilters } from './DocumentsFilters';
import { Documentos } from './';
import { DocumentsTypesModel } from '@server/domains/DocumentsTypes/Infraestructure';
import { UserModel } from '@server/domains/Users';

export class DocumentsRepositoryImplementation implements DocumentRepository {
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
        'motivo_firma_sin_conformidad',
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
          model: DocumentsTypesModel,
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
        requireSign: document.DocumentsTypesModel?.requiere_firma || false,
        signed: document.firmado,
        reasonSignatureNonConformity: document.motivo_firma_sin_conformidad,
        agreedment: document.firma_bajo_acuerdo,
        type: document.DocumentsTypesModel.denominacion,
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
      include: [
        {
          model: DocumentsTypesModel,
          attributes: ['denominacion', 'requiere_firma'],
        },
      ],
    });
    if (!document) return null;
    return Document.create({
      id,
      title: document.titulo,
      file: document.archivo,
      signed: document.firmado,
      reasonSignatureNonConformity: document.motivo_firma_sin_conformidad,
      type: document.DocumentsTypesModel.denominacion,
      agreedment: document.firma_bajo_acuerdo,
      requireSign: document.DocumentsTypesModel.requiere_firma,
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
    reasonSignatureNonConformity,
  }: ISignDocumentRepository): Promise<number | null> {
    console.log('Hacer algo con userID', requestContext);
    const rowsAffected = await Documentos.update(
      {
        firmado: new Date(),
        validacion_de_firma: validationSign,
        firma_bajo_acuerdo: agreement,
        motivo_firma_sin_conformidad: reasonSignatureNonConformity,
      },
      { where: { id } },
    );

    if (!id || !rowsAffected[0]) return null;

    return id;
  }

  async getDocumentsByCompany({
    filters,
    requestContext,
  }: IGetDocumentsByCompanyRepository): Promise<Document[]> {
    const ownerId = requestContext.values.ownerId;
    const { whereCondition, filterValidated, whereConditionSisTipoDocumentos } =
      DocumentsFilters(filters);

    const allDocuments = await Documentos.findAll({
      where: {
        ...whereCondition,
        ...filterValidated,
      },
      include: [
        {
          model: UserModel,
          as: 'User',
          required: true,
          where: {
            id_propietario: ownerId,
          },
          attributes: ['id', 'nombre', 'apellido'],
        },
        {
          model: DocumentsTypesModel,
          attributes: ['denominacion', 'requiere_firma'],
          where: whereConditionSisTipoDocumentos,
        },
      ],
      order: [[{ model: UserModel, as: 'User' }, 'apellido', 'ASC']],
    });

    return allDocuments.map((document) =>
      Document.create({
        id: document.id,
        title: document.titulo,
        uploadDate: document.fecha_de_subida,
        file: document.archivo,
        requireSign: document.DocumentsTypesModel?.requiere_firma || false,
        signed: document.firmado,
        reasonSignatureNonConformity: document.motivo_firma_sin_conformidad,
        agreedment: document.firma_bajo_acuerdo,
        type: document.DocumentsTypesModel.denominacion,
        validationSign: document.validacion_de_firma,
        view: document.visualizado,
        user: {
          id: document.User?.id || null,
          name: document.User?.nombre || '',
          surname: document.User?.apellido || '',
        },
      }),
    );
  }

  async getStatisticsDocuments({
    requestContext: _,
  }: IGetStatisticsDocumentsRepository): Promise<IGetStatisticsDocumentsResponseRepository> {
    const { filterValidated: filterValidatedPending } = DocumentsFilters({
      state: 'pendientes',
    });
    const { filterValidated: filterValidatedValidated } = DocumentsFilters({
      state: 'validados',
    });

    const totalDocuments = await Documentos.count();

    const pendingDocuments = await Documentos.count({
      where: {
        ...filterValidatedPending,
      },
      include: [
        {
          model: DocumentsTypesModel,
          attributes: [],
        },
      ],
    });

    const validatedDocuments = await Documentos.count({
      where: {
        ...filterValidatedValidated,
      },
      include: [
        {
          model: DocumentsTypesModel,
          attributes: [],
        },
      ],
    });

    return {
      total: totalDocuments,
      pending: pendingDocuments,
      validated: validatedDocuments,
    };
  }
}
