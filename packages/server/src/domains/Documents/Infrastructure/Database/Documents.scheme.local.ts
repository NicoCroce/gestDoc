import { Documents } from '@server/data';
import { delay } from '@server/utils/Utils';
import { IDocument } from '../../Domain';

interface IFilters {
  requireSign: boolean | null;
  type: string;
  title: string;
  date: Date | null;
  signed: boolean | null;
  view: boolean | null;
  validated: boolean | null;
}

const allDocuments = () =>
  Documents.map((document) => ({
    ...document,
    uploadDate: new Date(document.uploadDate),
    signed: (document.signed && new Date(document.signed)) || null,
    view: (document.view && new Date(document.view)) || null,
  }));

export class DocumentsSchemeLocal {
  getDocuments = async (filters: IFilters): Promise<IDocument[]> => {
    await delay();

    return allDocuments().filter(
      ({ requireSign, type, title, uploadDate, signed, view }) => {
        const matchSigned =
          filters.signed !== null ||
          (!filters.signed && signed === null) ||
          (filters.signed && signed !== null) ||
          filters.requireSign === null ||
          requireSign === filters.requireSign;

        const matchView =
          filters.view === null ||
          (filters.view && view !== null) ||
          (!filters.view && view === null);
        const matchType = !filters.type || type === filters.type;
        const matchTitle =
          !filters.title ||
          title.toLowerCase().includes(filters.title.toLowerCase());
        const matchDate = !filters.date || uploadDate >= filters.date;

        if (!filters.validated) {
          return (
            ((requireSign && !signed) || (!requireSign && !view)) &&
            matchType &&
            matchTitle &&
            matchDate &&
            matchSigned &&
            matchView
          );
        }

        if (filters.validated) {
          return (
            (signed || (!requireSign && view)) &&
            matchType &&
            matchTitle &&
            matchDate &&
            matchSigned &&
            matchView
          );
        }

        // Retornar solo los documentos que cumplen con todos los filtros
        return matchType && matchTitle && matchDate && matchSigned && matchView;
      },
    );
  };

  getDocument = async (documentId: number) => {
    await delay();
    return allDocuments().find(({ id }) => id === documentId);
  };

  viewDocument = async (documentId: number) => {
    await delay();
    const index = Documents.findIndex(({ id }) => id === documentId);

    if (index === -1) return null;

    if (!Documents[index].view) {
      Documents[index].view = new Date().toISOString();
    }

    return documentId;
  };

  signDocument = async (
    documentId: number,
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

    return documentId;
  };
}
