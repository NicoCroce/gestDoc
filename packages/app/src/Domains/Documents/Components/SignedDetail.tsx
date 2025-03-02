import { useSearchParams } from 'react-router-dom';
import { useGetDocument } from '../Hooks';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@app/Aplication/Components/ui/alert';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';

export const SignedDetail = () => {
  const [searchParams] = useSearchParams();
  const { currentDocument } = useGetDocument(
    searchParams.get('id') || undefined,
  );

  if (!currentDocument || !currentDocument?.signed) return null;

  const alertTitle = currentDocument.agreedment
    ? 'Firmado bajo conformidad'
    : 'Firmado sin conformidad';

  return (
    <Alert>
      <FontAwesomeIcon icon={faCircleInfo} />
      <AlertTitle>{alertTitle}</AlertTitle>
      <AlertDescription>
        {currentDocument.reasonSignatureNonConformity}
      </AlertDescription>
    </Alert>
  );
};
