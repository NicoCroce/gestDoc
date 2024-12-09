import { Button, Container, List, Text } from '@app/Aplication';
import { Document } from '../Document';
import { Alert, AlertTitle } from '@app/Aplication/Components/ui/alert';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import { ScrollArea } from '@app/Aplication/Components/ui/scroll-area';
import { Skeleton } from '@app/Aplication/Components/ui/skeleton';
import { TuseGetDocumentsByCompany } from '../../Hooks/useGetDocumentsByCompany';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@app/Aplication/Components/ui/accordion';

const SkeletonLoader = () => (
  <Container space="small">
    {Array.from({ length: 4 }).map((_, index) => (
      <Skeleton key={index} className="h-32 w-full rounded-xl" />
    ))}
  </Container>
);

interface DocumentsListProps {
  openFilters: () => void;
  service: TuseGetDocumentsByCompany;
}

export const DocumentsListByUser = ({
  openFilters,
  service,
}: DocumentsListProps) => {
  const { data, isLoading } = service;

  if (isLoading) {
    return <SkeletonLoader />;
  }

  if (data && !Object.keys(data).length)
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
        <ScrollArea className="h-[74vh] w-full">
          <List>
            {Object.keys(data)?.map((userId, index) => {
              const documents = data[Number(userId)].documents;

              return (
                <List.Li key={userId}>
                  <Accordion type="single" collapsible defaultValue="item-0">
                    <AccordionItem value={`item-${index}`}>
                      <AccordionTrigger>
                        {data[Number(userId)].user}
                      </AccordionTrigger>
                      <AccordionContent>
                        <List>
                          {documents.map((document) => (
                            <List.Li key={document.id}>
                              <Document {...document} />
                            </List.Li>
                          ))}
                        </List>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </List.Li>
              );
            })}
          </List>
        </ScrollArea>
      ) : (
        <Text.Muted>Cargando</Text.Muted>
      )}
    </>
  );
};
