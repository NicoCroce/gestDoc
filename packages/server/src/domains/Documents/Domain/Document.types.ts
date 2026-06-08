export type TStateDocument = 'validados' | 'pendientes';

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
  user?: {
    id: number | null;
    name: string;
    surname: string;
  };
}
