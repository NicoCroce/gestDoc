import { MenuItem } from '@app/Aplication';
import { CERTIFICATES_ROUTES } from './Certificates.routes';
import { faFileContract } from '@fortawesome/free-solid-svg-icons';

export const MenuCertificates = () => (
  <MenuItem
    to={CERTIFICATES_ROUTES}
    icon={faFileContract}
    text="Mis Licencias"
  />
);
