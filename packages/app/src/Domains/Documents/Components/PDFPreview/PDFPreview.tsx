import { useURLParams } from '@app/Aplication';
import { TDocumentSearch } from '../../Document.entity';
import { useGetDocument } from '../../Hooks';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@app/Aplication/Components/ui/alert';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleExclamation,
  faHourglass,
} from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';

export const PDFPreview = () => {
  const { searchParams } = useURLParams<TDocumentSearch>();
  const { currentDocument, isLoading } = useGetDocument(searchParams?.id);
  const [onLoad, setOnload] = useState(false);

  useEffect(() => {
    setOnload(false);
    setTimeout(() => {
      setOnload(true);
    }, 500);
  }, [currentDocument]);

  if (!currentDocument) {
    return (
      <Alert className="max-w-lg">
        <FontAwesomeIcon icon={faCircleExclamation} size="lg" />
        <AlertTitle>Para visualizarlo debe seleccionar un documento</AlertTitle>
        <AlertDescription>
          Una vez lo selecciona podrá firmarlo
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading || !onLoad)
    return (
      <Alert className="max-w-lg">
        <FontAwesomeIcon icon={faHourglass} size="lg" />
        <AlertTitle>Obteniendo información</AlertTitle>
        <AlertDescription>Esta opración puede demorar...</AlertDescription>
      </Alert>
    );

  const hideToolbar =
    !currentDocument.signed && currentDocument.requireSign
      ? '#zoom=85&scrollbar=1&toolbar=0&navpanes=0'
      : '';

  return (
    <object
      data={(currentDocument.file as string) + hideToolbar}
      type="application/pdf"
      width="100%"
      className="h-full"
    >
      <p>
        PDF
        <a href={currentDocument.file as string}>
          Download pdf <span>{currentDocument.file as string}</span>
        </a>
      </p>
    </object>
  );
};
