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

interface IFilters {
  requireSign: boolean;
  type: string;
  title: string;
  date: Date | null;
  signed: Date | null;
}

export class DocumentsScheme {
  getDocuments = async (filters: IFilters): Promise<TDocument[]> => {
    delay();

    const allDocuments = Documents.map((document) => ({
      ...document,
      uploadDate: new Date(document.uploadDate),
    }));

    return allDocuments.filter(
      ({ requireSign, type, title, uploadDate, signed }) => {
        const matchRequireSign = requireSign === filters.requireSign;
        const matchSigned = signed === filters.signed;
        const matchType = !filters.type || type === filters.type;
        const matchTitle =
          !filters.title ||
          title.toLowerCase().includes(filters.title.toLowerCase());
        const matchDate = !filters.date || uploadDate >= filters.date;

        // Retornar solo los documentos que cumplen con todos los filtros
        return (
          matchRequireSign &&
          matchType &&
          matchTitle &&
          matchDate &&
          matchSigned
        );
      },
    );
  };
}
