import { useURLParams } from '@app/Aplication';
import { TDocumentSearch } from '../Document.entity';
import { documentsService } from '../Documents.service';

export const useGetDocuments = () => {
  const { searchParams } = useURLParams<TDocumentSearch>();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, ...filterSearchParams } = searchParams || {};

  return documentsService.getAll.useQuery(
    {
      ...filterSearchParams,
    },
    {
      staleTime: 3000, // Los datos no se refetchan durante 3 segundos
    },
  );
};

export type TuseGetDocuments = ReturnType<typeof useGetDocuments>;
