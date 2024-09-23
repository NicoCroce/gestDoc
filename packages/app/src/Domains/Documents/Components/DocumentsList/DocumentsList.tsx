import { Button, Container, List, Text } from '@app/Aplication';
import { useGetDocuments } from '../../Hooks/useGetDocuments';
import { Document } from '../Document';
import { Alert, AlertTitle } from '@app/Aplication/Components/ui/alert';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import { Skeleton } from '@app/Aplication/Components/ui/skeleton';

interface DocumentsListProps {
  openFilters: () => void;
}

export const DocumentsList = ({ openFilters }: DocumentsListProps) => {
  const { data, isLoading } = useGetDocuments();

  if (isLoading) {
    return (
      <Container space="small">
        <Skeleton className="h-44 w-full rounded-xl"></Skeleton>
        <Skeleton className="h-44 w-full rounded-xl"></Skeleton>
        <Skeleton className="h-44 w-full rounded-xl"></Skeleton>
        <Skeleton className="h-44 w-full rounded-xl"></Skeleton>
      </Container>
    );
  }

  if (!data?.length)
    return (
      <Alert>
        <FontAwesomeIcon icon={faCircleExclamation} size="lg" />
        <AlertTitle>No se encontraron coincidencias</AlertTitle>
        <Button variant="link" onClick={openFilters}>
          Prueba cambiando los filtros
        </Button>
      </Alert>
    );

  return (
    <>
      {data ? (
        <List>
          {data?.map((document) => (
            <List.Li key={document.id}>
              <Document {...document} />
            </List.Li>
          ))}
        </List>
      ) : (
        <Text.Muted>Cargando</Text.Muted>
      )}
    </>
  );
};
