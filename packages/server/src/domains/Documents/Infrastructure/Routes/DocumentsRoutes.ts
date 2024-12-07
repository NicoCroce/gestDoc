import { documentsController } from '../../documents.app';

export const DocumentsRoutes = () => {
  const {
    getDocuments,
    getDocument,
    viewDocument,
    signDocument,
    getDocumentsByCompany,
  } = documentsController();

  return {
    documents: {
      getAll: getDocuments,
      get: getDocument,
      sign: signDocument,
      view: viewDocument,
      getAllByCompany: getDocumentsByCompany,
    },
  };
};
