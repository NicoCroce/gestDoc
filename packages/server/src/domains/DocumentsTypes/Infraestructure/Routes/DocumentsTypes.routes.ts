import { documentsTypesController } from '../documentTypes.app';

export const DocumentsTypesRoutes = () => {
  const { getDocumentsTypes } = documentsTypesController();

  return {
    documentsType: {
      getAll: getDocumentsTypes,
    },
  };
};
