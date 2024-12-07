import { Route } from 'react-router-dom';
import { DocumentsCompanyPage, DocumentsListPage } from './Pages';

import { DOCUMENTS_DASHBOARD, DOCUMENTS_ROUTE } from './Documents.routes';

export const DocumentsRouter = [
  <Route
    key="documents-list"
    path={DOCUMENTS_ROUTE}
    element={<DocumentsListPage />}
  />,
  <Route
    key="documents-dashboard"
    path={DOCUMENTS_DASHBOARD}
    element={<DocumentsCompanyPage />}
  />,
];
