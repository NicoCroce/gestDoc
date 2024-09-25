import { IRequestContext } from '@server/Application/Interfaces';

export interface IGetDocuments extends IRequestContext {
  input: {
    requireSign: boolean | null; // Si rquiere firma, si es null retora todo.
    type: string;
    title: string;
    date: Date | null;
    signed: boolean | null; // si fue firmado, si es null retora todo.
    view: boolean | null;
    validated: boolean | null;
  };
}

export interface IViewDocument extends IRequestContext {
  input: string; // document Id
}

export interface ISignDocument extends IRequestContext {
  input: {
    documentId: string;
    password: string;
    agreement: boolean;
  };
}

export interface IGetDocument extends IRequestContext {
  input: string; //document Id
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
  agreedment: null | boolean;
}
