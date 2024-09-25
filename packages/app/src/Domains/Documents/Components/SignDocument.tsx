import { Button, Container, useURLParams } from '@app/Aplication';
import { TDocumentSearch, VALIDATED } from '../Document.entity';
import { useGetDocument } from '../Hooks';
import { faThumbsDown, faThumbsUp } from '@fortawesome/free-solid-svg-icons';

export const SignDocument = () => {
  const { searchParams } = useURLParams<TDocumentSearch>();
  const { currentDocument } = useGetDocument(searchParams?.id);

  if (!currentDocument) return null;

  const disabled =
    searchParams?.state === VALIDATED || !currentDocument.requireSign;

  return (
    <Container row>
      <Button
        disabled={disabled}
        variant="outline"
        icon={faThumbsDown}
        showIcon
      >
        Firmo sin conformidad
      </Button>
      <Button disabled={disabled} icon={faThumbsUp} showIcon>
        Firmo con conformidad
      </Button>
    </Container>
  );
};
