import { DASHBOARD_ACCESS, MenuItem } from '@app/Aplication';
import { faChartLine } from '@fortawesome/free-solid-svg-icons';
import {
  ADMIN_DASHBOARD,
  DOCUMENTS_DASHBOARD,
  LICENSES_DASHBOARD,
} from './Admin.routes';

export const MenuDashboard = () => (
  <>
    <MenuItem
      to={ADMIN_DASHBOARD}
      text="Administrar"
      icon={faChartLine}
      permission={DASHBOARD_ACCESS}
      redirect={DOCUMENTS_DASHBOARD}
    >
      <MenuItem
        to={DOCUMENTS_DASHBOARD}
        text="Documentos"
        permission={DASHBOARD_ACCESS}
      />
      <MenuItem
        to={LICENSES_DASHBOARD}
        text="Licencias"
        permission={DASHBOARD_ACCESS}
      />
    </MenuItem>
  </>
);
