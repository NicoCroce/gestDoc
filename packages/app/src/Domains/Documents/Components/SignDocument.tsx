import { Button, Container, useURLParams } from '@app/Aplication';
import { TDocumentSearch } from '../Document.entity';
import { useGetDocument } from '../Hooks';
import { faThumbsDown, faThumbsUp } from '@fortawesome/free-solid-svg-icons';

export const SignDocument = () => {
  const { searchParams } = useURLParams<TDocumentSearch>();
  const { data } = useGetDocument(searchParams?.id);

  if (!data) return null;

  return (
    <Container row>
      <Button variant="outline" icon={faThumbsDown} showIcon>
        Firmo sin conformidad
      </Button>
      <Button icon={faThumbsUp} showIcon>
        Firmo con conformidad
      </Button>
    </Container>
  );
};
