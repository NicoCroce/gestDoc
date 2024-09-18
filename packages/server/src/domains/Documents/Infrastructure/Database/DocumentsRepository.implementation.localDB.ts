/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Document,
  DocumentRepository,
  IGetDocumentsRepository,
  ISignDocumentRepository,
  IViewDocumentRepository,
} from '../../Domain';
import { DocumentsScheme } from './Documents.scheme';

export class DocumentsRepositoryImplementation implements DocumentRepository {
  private readonly DB = new DocumentsScheme();

  async getDocuments({
    requestContext,
  }: IGetDocumentsRepository): Promise<Document[]> {
    console.log('Hacer algo con userID', requestContext);
    const documents = await this.DB.getDocuments();
    return documents?.map((document) => Document.create(document));
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
