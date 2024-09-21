import { documentsController } from '../../documents.app';

const { getDocuments } = documentsController;

export const DocumentsRoutes = {
  documents: {
    getAll: getDocuments,
  },
};
