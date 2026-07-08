import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';

interface EmptyScreenErrorProps {
  message?: string;
}

export const EmptyScreenError = ({
  message = 'Ocurrió un error al cargar los datos',
}: EmptyScreenErrorProps) => (
  <Alert variant="destructive">
    <FontAwesomeIcon icon={faTriangleExclamation} size="lg" />
    <AlertTitle>Error</AlertTitle>
    <AlertDescription>{message}</AlertDescription>
  </Alert>
);
