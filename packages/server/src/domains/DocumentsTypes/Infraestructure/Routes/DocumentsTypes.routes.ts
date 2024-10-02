import { documentsTypesController } from '../documentTypes.app';

const { getDocumentsTypes } = documentsTypesController;

export const DocumentsTypesRoutes = {
  documentsType: {
    getAll: getDocumentsTypes,
  },
};
