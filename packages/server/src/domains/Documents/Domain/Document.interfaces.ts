import { IRequestContext } from '@server/Application/Interfaces';

export interface IGetDocuments extends IRequestContext {}

export interface IViewDocument extends IRequestContext {
  input: string; // document Id
}

export interface ISignDocument extends IRequestContext {
  input: {
    id: string;
    validationSign: string;
  };
}

export interface IDocument {
  id: string;
  uploadDate: Date;
  title: string;
  file: unknown;
  signed: Date | null;
  view: Date | null;
  type: string;
  requireSign: boolean;
  validationSign: string | null;
}
