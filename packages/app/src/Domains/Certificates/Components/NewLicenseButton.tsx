import { Button } from '@app/Aplication';
import { faAdd } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { CERTIFICATES_ROUTES_ADD } from '../Certificates.routes';

export const NewLicenseButton = () => {
  return (
    <Link to={CERTIFICATES_ROUTES_ADD}>
      <Button showIcon icon={faAdd}>
        Cargar certificado
      </Button>
    </Link>
  );
};
