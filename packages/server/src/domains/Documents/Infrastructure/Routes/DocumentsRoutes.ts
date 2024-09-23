import { documentsController } from '../../documents.app';

const { getDocuments, getDocument } = documentsController;

export const DocumentsRoutes = {
  documents: {
    getAll: getDocuments,
    get: getDocument,
  },
};
