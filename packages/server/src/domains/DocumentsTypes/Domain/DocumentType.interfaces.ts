import { IRequestContext } from '@server/Application';

export interface IGetDocumentsTypes extends IRequestContext {}

export interface IDocumentType {
  id: number;
  denomination: string;
  signRequired: boolean;
}
