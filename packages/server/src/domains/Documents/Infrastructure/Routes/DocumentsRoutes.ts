import { documentsController } from '../../documents.app';

export const DocumentsRoutes = () => {
  const {
    getDocuments,
    getDocument,
    viewDocument,
    signDocument,
    getDocumentsByCompany,
    getStatisticsDocuments,
  } = documentsController();

  return {
    documents: {
      getAll: getDocuments,
      get: getDocument,
      sign: signDocument,
      view: viewDocument,
      getAllByCompany: getDocumentsByCompany,
      getStatistics: getStatisticsDocuments,
    },
  };
};
