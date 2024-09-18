import { IRequestContext } from '@server/Application';
import { Document } from './Document.entity';

export interface IGetDocumentsRepository extends IRequestContext {}
export interface IViewDocumentRepository extends IRequestContext {
  id: string;
}
export interface ISignDocumentRepository extends IRequestContext {
  id: string;
  validationSign: string;
}

export interface DocumentRepository {
  getDocuments({
    requestContext,
  }: IGetDocumentsRepository): Promise<Document[]>;
  viewDocument({
    requestContext,
    id,
  }: IViewDocumentRepository): Promise<Document>;
  signDocument({
    requestContext,
    id,
    validationSign,
  }: ISignDocumentRepository): Promise<Document>;
}
