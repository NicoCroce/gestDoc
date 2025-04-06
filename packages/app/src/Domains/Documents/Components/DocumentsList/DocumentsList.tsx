import { Container, EmptyScreenFilter, List, Text } from '@app/Aplication';
import { TuseGetDocuments } from '../../Hooks/useGetDocuments';
import { Document } from '../Document';
import { ScrollArea } from '@app/Aplication/Components/ui/scroll-area';
import { Skeleton } from '@app/Aplication/Components/ui/skeleton';

const SkeletonLoader = () => (
  <Container space="small">
    {Array.from({ length: 4 }).map((_, index) => (
      <Skeleton key={index} className="h-32 w-full rounded-xl" />
    ))}
  </Container>
);

interface DocumentsListProps {
  openFilters: () => void;
  service: TuseGetDocuments;
}

export const DocumentsList = ({ openFilters, service }: DocumentsListProps) => {
  const { data, isLoading } = service;

  if (isLoading) {
    return <SkeletonLoader />;
  }

  if (!data?.length) return <EmptyScreenFilter onClick={openFilters} />;

  return (
    <>
      {data ? (
        <ScrollArea className="h-[74vh] w-full">
          <List>
            {data?.map((document) => (
              <List.Li key={document.id}>
                <Document {...document} />
              </List.Li>
            ))}
          </List>
        </ScrollArea>
      ) : (
        <Text.Muted>Cargando</Text.Muted>
      )}
    </>
  );
};
