import { documentsController } from '../../documents.app';

const { getDocuments, getDocument, viewDocument, signDocument } =
  documentsController;

export const DocumentsRoutes = {
  documents: {
    getAll: getDocuments,
    get: getDocument,
    sign: signDocument,
    view: viewDocument,
  },
};
