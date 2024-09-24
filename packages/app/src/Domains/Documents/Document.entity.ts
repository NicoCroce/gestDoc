export type TDocument = {
  id: string;
  uploadDate: Date;
  title: string;
  file: unknown;
  signed: Date | null;
  view: Date | null;
  type: string;
  requireSign: boolean;
  validationSign: string | null;
  agreedment: boolean | null;
};

export type TIsSigned = 'validados' | 'pendientes';

export type TDocumentSearch = {
  signed?: TIsSigned;
  title?: string;
  type?: string;
  id?: string;
};

export const VALIDATED: TIsSigned = 'validados';
export const PENDING: TIsSigned = 'pendientes';

export const VACATIONS = 'vacaciones';
export const RECEIPT = 'recibo';
export const ACCORDANCE = 'conformidad';
