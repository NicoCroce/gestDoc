import { Button, Container, useURLParams } from '@app/Aplication';
import { TDocumentSearch, VALIDATED } from '../Document.entity';
import { useGetDocument } from '../Hooks';
import { faThumbsDown, faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import { ConfirmWithPassword } from '@app/Aplication/Components/Molecules/ConfirmWithPassword';
import { useSignDocument } from '../Hooks/useSignDocument';
import { useEffect, useState } from 'react';

export const SignDocument = () => {
  const { searchParams } = useURLParams<TDocumentSearch>();
  const { currentDocument } = useGetDocument(searchParams?.id);
  const { mutate, isPending, isSuccess } = useSignDocument();
  const [sign, setSign] = useState<boolean | 'agreement' | 'disagreement'>(
    false,
  );

  useEffect(() => {
    console.log('pasa');
    isSuccess && setSign(false);
  }, [isSuccess]);

  if (!currentDocument) return null;

  const disabled =
    searchParams?.state === VALIDATED || !currentDocument.requireSign;

  const signDocument = (password: string) =>
    mutate({
      documentId: Number(searchParams?.id),
      password,
      agreement: sign === 'agreement',
    });

  const onCloseDialog = () => setSign(false);

  console.log(!!sign);

  return (
    <>
      <Container row>
        <Button
          disabled={disabled}
          variant="outline"
          icon={faThumbsDown}
          showIcon
          onClick={() => setSign('disagreement')}
        >
          Firmo sin conformidad
        </Button>
        <Button
          disabled={disabled}
          icon={faThumbsUp}
          showIcon
          onClick={() => setSign('agreement')}
        >
          Firmo con conformidad
        </Button>
      </Container>
      <ConfirmWithPassword
        onConfirm={signDocument}
        textDescription="Ingresando su constraseña confirma la firma de este documento"
        isLoading={isPending}
        isOpen={sign ? true : false}
        onCloseDialog={onCloseDialog}
      />
    </>
  );
};
