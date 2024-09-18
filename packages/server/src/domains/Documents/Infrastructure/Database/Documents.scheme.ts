import { Documents } from '@server/data';
import { delay } from '@server/utils/Utils';

type TDocument = {
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

export class DocumentsScheme {
  getDocuments = async (): Promise<TDocument[]> => {
    delay();

    return Documents.map((document) => ({
      ...document,
      uploadDate: new Date(document.uploadDate),
    }));
  };
}
