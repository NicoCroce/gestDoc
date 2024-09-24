import { Documents } from '@server/data';
import { delay } from '@server/utils/Utils';
import { IDocument } from '../../Domain';

interface IFilters {
  requireSign: boolean | null;
  type: string;
  title: string;
  date: Date | null;
  signed: boolean | null;
}

const allDocuments = () =>
  Documents.map((document) => ({
    ...document,
    uploadDate: new Date(document.uploadDate),
    signed: (document.signed && new Date(document.signed)) || null,
    view: (document.view && new Date(document.view)) || null,
  }));

export class DocumentsScheme {
  getDocuments = async (filters: IFilters): Promise<IDocument[]> => {
    await delay();

    return allDocuments().filter(
      ({ requireSign, type, title, uploadDate, signed }) => {
        const matchRequireSign =
          filters.requireSign === null || requireSign === filters.requireSign;
        const matchSigned =
          filters.signed === null ||
          (!filters.signed && signed === null) ||
          (filters.signed && signed !== null);

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

  getDocument = async (documentId: string) => {
    await delay();
    return allDocuments().find(({ id }) => id === documentId);
  };

  viewDocument = async (documentId: string) => {
    await delay();
    const index = Documents.findIndex(({ id }) => id === documentId);

    if (index === -1) return null;

    if (!Documents[index].view) {
      Documents[index].view = new Date().toISOString();
    }
  };

  signDocument = async (
    documentId: string,
    agreedment: boolean,
    validationSign: string,
  ) => {
    await delay();
    const index = Documents.findIndex(({ id }) => id === documentId);

    if (index === -1) return null;

    if (!Documents[index].signed) {
      Documents[index].signed = new Date().toISOString();
      Documents[index].agreedment = agreedment;
      Documents[index].validationSign = validationSign;
    }
  };
}
