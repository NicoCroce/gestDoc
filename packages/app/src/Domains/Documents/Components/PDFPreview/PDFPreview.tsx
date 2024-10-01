import { useGlobalStore, useURLParams } from '@app/Aplication';
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
import { PDFPreviewMobile } from './PDFPreviewMobile';

export const PDFPreview = () => {
  const { searchParams } = useURLParams<TDocumentSearch>();
  const { currentDocument, isLoading } = useGetDocument(searchParams?.id);
  const [onLoad, setOnload] = useState(false);
  const { data: isMobile } = useGlobalStore('isMobile');

  useEffect(() => {
    setOnload(false);
    setTimeout(() => {
      setOnload(true);
    }, 500);
  }, [currentDocument]);

  if (!currentDocument) {
    if (isMobile) return null;
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

  if (!isMobile && (isLoading || !onLoad))
    return (
      <Alert className="max-w-lg">
        <FontAwesomeIcon icon={faHourglass} size="lg" />
        <AlertTitle>Obteniendo información</AlertTitle>
        <AlertDescription>Esta opración puede demorar...</AlertDescription>
      </Alert>
    );

  if (isMobile) {
    return <PDFPreviewMobile file={currentDocument.file as string} />;
  }

  return (
    <object
      data={currentDocument.file as string}
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
