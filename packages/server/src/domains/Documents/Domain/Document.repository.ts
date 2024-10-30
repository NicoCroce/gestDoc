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
    validated: boolean | null;
  };
}
export interface IViewDocumentRepository extends IRequestContext {
  id: number;
}
export interface ISignDocumentRepository extends IRequestContext {
  id: number;
  validationSign: string;
  agreement: boolean;
  reasonSignatureNonConformity: string | null;
}

export interface IGetDocumentRepository extends IRequestContext {
  id: number;
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
  }: IViewDocumentRepository): Promise<number | null>;
  signDocument({
    requestContext,
    id,
    validationSign,
    agreement,
  }: ISignDocumentRepository): Promise<number | null>;
}
