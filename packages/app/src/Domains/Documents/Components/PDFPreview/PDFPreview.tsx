import { useURLParams } from '@app/Aplication';
import { TDocumentSearch } from '../../Document.entity';
import { useGetDocument } from '../../Hooks';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@app/Aplication/Components/ui/alert';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHourglass } from '@fortawesome/free-solid-svg-icons';

export const PDFPreview = () => {
  const { searchParams } = useURLParams<TDocumentSearch>();
  const { data, isLoading } = useGetDocument(searchParams?.id);

  console.log(data);

  if (!data || isLoading)
    return (
      <Alert className="max-w-lg">
        <FontAwesomeIcon icon={faHourglass} />
        <AlertTitle>Obteniendo información</AlertTitle>
        <AlertDescription>Esta opración puede demorar...</AlertDescription>
      </Alert>
    );

  return (
    <object
      data={data.file as string}
      type="application/pdf"
      width="100%"
      className="h-full"
    >
      <p>
        PDF
        <a href={data.file as string}>to the PDF!</a>
      </p>
    </object>
  );
};
