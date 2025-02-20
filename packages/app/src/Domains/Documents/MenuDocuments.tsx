import { DASHBOARD_ACCESS, MenuItem } from '@app/Aplication';
import { DOCUMENTS_DASHBOARD, DOCUMENTS_ROUTE } from './Documents.routes';
import { faChartLine, faFile } from '@fortawesome/free-solid-svg-icons';

export const MenuDocuments = () => (
  <MenuItem to={DOCUMENTS_ROUTE} text="Documentos" icon={faFile} />
);

export const MenuDashboard = () => (
  <MenuItem
    to={DOCUMENTS_DASHBOARD}
    text="Administrar"
    icon={faChartLine}
    permission={DASHBOARD_ACCESS}
  />
);
