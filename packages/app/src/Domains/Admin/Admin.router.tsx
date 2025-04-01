import { Route } from 'react-router-dom';
import { DOCUMENTS_DASHBOARD, LICENSES_DASHBOARD } from './Admin.routes';
import { DocumentsCompanyPage, LicensesCompanyPage } from './Pages';

export const AdminRouter = [
  <Route
    key="documents-dashboard"
    path={DOCUMENTS_DASHBOARD}
    element={<DocumentsCompanyPage />}
  />,
  <Route
    key="licenses-dashboard"
    path={LICENSES_DASHBOARD}
    element={<LicensesCompanyPage />}
  />,
];
