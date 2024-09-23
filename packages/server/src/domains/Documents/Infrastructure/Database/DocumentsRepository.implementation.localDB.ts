/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Document,
  DocumentRepository,
  IGetDocumentRepository,
  IGetDocumentsRepository,
  ISignDocumentRepository,
  IViewDocumentRepository,
} from '../../Domain';
import { DocumentsScheme } from './Documents.scheme';

export class DocumentsRepositoryImplementation implements DocumentRepository {
  private readonly DB = new DocumentsScheme();

  async getDocuments({
    filters,
    requestContext,
  }: IGetDocumentsRepository): Promise<Document[]> {
    console.log('Hacer algo con userID', requestContext);
    const documents = await this.DB.getDocuments(filters);
    return documents?.map((document) => Document.create(document));
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
  }: IViewDocumentRepository): Promise<Document> {
    throw new Error('Method not implemented.');
  }
  signDocument({
    requestContext,
    id,
    validationSign,
  }: ISignDocumentRepository): Promise<Document> {
    throw new Error('Method not implemented.');
  }
}
