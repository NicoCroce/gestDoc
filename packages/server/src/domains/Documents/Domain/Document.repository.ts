import { IRequestContext } from '@server/Application';
import { Document } from './Document.entity';

export interface IGetDocumentsRepository extends IRequestContext {
  filters: {
    requireSign: boolean | null;
    type: string;
    title: string;
    date: Date | null;
    signed: boolean | null;
    view: boolean | null;
  };
}
export interface IViewDocumentRepository extends IRequestContext {
  id: string;
}
export interface ISignDocumentRepository extends IRequestContext {
  id: string;
  validationSign: string;
  agreement: boolean;
}

export interface IGetDocumentRepository extends IRequestContext {
  id: string;
}

export interface DocumentRepository {
  getDocuments({
    filters,
    requestContext,
  }: IGetDocumentsRepository): Promise<Document[]>;
  getDocument({
    id,
    requestContext,
  }: IGetDocumentRepository): Promise<Document | null>;
  viewDocument({
    requestContext,
    id,
  }: IViewDocumentRepository): Promise<void | null>;
  signDocument({
    requestContext,
    id,
    validationSign,
    agreement,
  }: ISignDocumentRepository): Promise<void | null>;
}
