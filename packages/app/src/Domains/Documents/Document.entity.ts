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
};

export type TIsSigned = 'firmados' | 'pendientes';

export type TDocumentSearch = {
  signed?: TIsSigned;
  title?: string;
  type?: string;
  id?: string;
};

export const SIGNED: TIsSigned = 'firmados';
export const PENDING: TIsSigned = 'pendientes';

export const VACATIONS = 'vacaciones';
export const RECEIPT = 'recibo';
export const ACCORDANCE = 'conformidad';
