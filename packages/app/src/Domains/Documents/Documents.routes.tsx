import { Route } from 'react-router-dom';
import { DocumentsListPage } from './Pages';

export const DOCUMENTS_ROUTE = '/documents';

export const DocumentsRouter = [
  <Route
    key="documents-list"
    path={DOCUMENTS_ROUTE}
    element={<DocumentsListPage />}
  />,
];
