export type TDocument = {
  id: string | number;
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

export type TStateDocument = 'validados' | 'pendientes';

export type TDocumentSearch = {
  state?: TStateDocument;
  title?: string;
  type?: string;
  id?: string;
};

export const VALIDATED: TStateDocument = 'validados';
export const PENDING: TStateDocument = 'pendientes';
