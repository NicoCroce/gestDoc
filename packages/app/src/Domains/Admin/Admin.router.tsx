import { Route } from 'react-router-dom';
import {
  DOCUMENTS_DASHBOARD,
  LICENSES_DASHBOARD,
  EMPLEADOS_DASHBOARD,
} from './Admin.routes';
import { DocumentsCompanyPage, LicensesCompanyPage } from './Pages';
import { EmpleadosPage } from './Empleados';

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
  <Route
    key="empleados-dashboard"
    path={EMPLEADOS_DASHBOARD}
    element={<EmpleadosPage />}
  />,
];
