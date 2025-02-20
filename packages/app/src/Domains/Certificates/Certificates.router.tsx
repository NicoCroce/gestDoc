import { Route } from 'react-router-dom';
import { CERTIFICATES_ROUTES } from './Certificates.routes';
import { CertificateListPage } from './Pages';

export const CertificatesRouter = [
  <Route
    key="certificates-list"
    path={CERTIFICATES_ROUTES}
    element={<CertificateListPage />}
  />,
];
