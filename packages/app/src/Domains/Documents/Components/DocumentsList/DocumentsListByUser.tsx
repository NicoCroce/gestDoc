import { Container, EmptyScreenFilter, List, Text } from '@app/Aplication';
import { Document } from '../Document';
import { ScrollArea } from '@app/Aplication/Components/ui/scroll-area';
import { Skeleton } from '@app/Aplication/Components/ui/skeleton';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@app/Aplication/Components/ui/accordion';
import { TuseGetDocumentsByCompany } from '@app/Domains/Admin';

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
    return <EmptyScreenFilter onClick={openFilters} />;

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
                      <AccordionTrigger className="px-4">
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
