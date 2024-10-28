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
  input: number; // document Id
}

export interface ISignDocument extends IRequestContext {
  input: {
    documentId: number;
    password: string;
    agreement: boolean;
    reasonSignatureNonConformity: string | null;
  };
}

export interface IGetDocument extends IRequestContext {
  input: number; //document Id
}

export interface IDocument {
  id: number;
  uploadDate: Date;
  title: string;
  file: unknown;
  signed: Date | null;
  reasonSignatureNonConformity: string | null;
  view: Date | null;
  type: string;
  requireSign: boolean;
  validationSign: string | null;
  agreedment: null | boolean;
}
