import { IRequestContext } from '@server/Application';
import { Document } from './Document.entity';

export interface IGetDocumentsRepository extends IRequestContext {
  filters: {
    requireSign: boolean;
    type: string;
    title: string;
    date: Date | null;
    signed: Date | null;
  };
}
export interface IViewDocumentRepository extends IRequestContext {
  id: string;
}
export interface ISignDocumentRepository extends IRequestContext {
  id: string;
  validationSign: string;
}

export interface DocumentRepository {
  getDocuments({
    filters,
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
