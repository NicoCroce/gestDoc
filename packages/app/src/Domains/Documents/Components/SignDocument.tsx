import {
  Button,
  Container,
  useGlobalStore,
  useURLParams,
} from '@app/Aplication';
import { TDocumentSearch, VALIDATED } from '../Document.entity';
import { useGetDocument } from '../Hooks';
import { faThumbsDown, faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import { ConfirmWithPassword } from '@app/Aplication/Components/Molecules';
import { useSignDocument } from '../Hooks/useSignDocument';
import { useEffect, useState } from 'react';

export const SignDocument = () => {
  const { searchParams } = useURLParams<TDocumentSearch>();
  const { currentDocument } = useGetDocument(searchParams?.id);
  const { mutate, isPending, isSuccess } = useSignDocument();
  const [sign, setSign] = useState<boolean | 'agreement' | 'disagreement'>(
    false,
  );
  const { data: isMobile } = useGlobalStore('isMobile');

  useEffect(() => {
    isSuccess && setSign(false);
  }, [isSuccess]);

  if (!currentDocument) return null;

  const disabled =
    searchParams?.state === VALIDATED || !currentDocument.requireSign;

  const signDocument = (password: string, reason: string) =>
    mutate({
      documentId: Number(searchParams?.id),
      password,
      agreement: sign === 'agreement',
      reasonSignatureNonConformity: reason,
    });

  const onCloseDialog = () => setSign(false);

  return (
    <>
      <Container row>
        <Button
          disabled={disabled}
          variant="outline"
          icon={faThumbsDown}
          showIcon
          onClick={() => setSign('disagreement')}
          className="flex-auto"
        >
          {isMobile ? 'sin conformidad' : 'Firmo sin conformidad'}
        </Button>
        <Button
          disabled={disabled}
          icon={faThumbsUp}
          showIcon
          onClick={() => setSign('agreement')}
          className="flex-auto"
        >
          {isMobile ? 'con conformidad' : 'Firmo con conformidad'}
        </Button>
      </Container>
      <ConfirmWithPassword
        onConfirm={signDocument}
        textDescription="Ingresando su constraseña confirma la firma de este documento"
        isLoading={isPending}
        isOpen={sign ? true : false}
        onCloseDialog={onCloseDialog}
        signType={sign === 'agreement' ? 'agreement' : 'disagreement'}
      />
    </>
  );
};
