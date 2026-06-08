import { Button, Container, useURLParams } from '@app/Application';
import { TDocumentSearch, VALIDATED } from '../Document.entity';
import { useGetDocument } from '../Hooks';
import { faThumbsDown, faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import { ConfirmWithPassword } from '@app/Application/Components/Molecules';
import { useSignDocument } from '../Hooks/useSignDocument';
import { useState } from 'react';

export const SignDocument = () => {
  const { searchParams } = useURLParams<TDocumentSearch>();
  const { currentDocument } = useGetDocument(searchParams?.id);
  const { mutate, isPending } = useSignDocument();
  const [sign, setSign] = useState<boolean | 'agreement' | 'disagreement'>(
    false,
  );

  if (!currentDocument) return null;
  if (searchParams?.state === VALIDATED) return null;

  const disabled = !currentDocument.requireSign;

  const signDocument = (password: string, reason: string) =>
    mutate(
      {
        documentId: Number(searchParams?.id),
        password,
        agreement: sign === 'agreement',
        reasonSignatureNonConformity: reason,
      },
      { onSuccess: () => setSign(false) },
    );

  const onCloseDialog = () => setSign(false);

  return (
    <>
      <Container row className="flex-wrap">
        <Button
          disabled={disabled}
          variant="outline"
          icon={faThumbsDown}
          showIcon
          onClick={() => setSign('disagreement')}
          className="flex-auto"
        >
          Firmo sin conformidad
        </Button>
        <Button
          disabled={disabled}
          icon={faThumbsUp}
          showIcon
          onClick={() => setSign('agreement')}
          className="flex-auto"
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
        signType={sign === 'agreement' ? 'agreement' : 'disagreement'}
      />
    </>
  );
};
