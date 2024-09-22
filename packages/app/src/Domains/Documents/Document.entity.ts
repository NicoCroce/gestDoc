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

export type TIsSigned = 'signed' | 'pending';

export type TDocumentSearch = {
  signed?: TIsSigned;
  title: string;
};

export const SIGNED: TIsSigned = 'signed';
export const PENDING: TIsSigned = 'pending';
