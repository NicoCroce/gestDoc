import { useURLParams } from '@app/Aplication';
import { documentsService, TDocumentSearch } from '@app/Domains/Documents';

export const useGetDocumentsByCompany = () => {
  const { searchParams } = useURLParams<TDocumentSearch>();

  const { id, ...filterSearchParams } = searchParams || {};

  return documentsService.getAllByCompany.useQuery(
    {
      ...filterSearchParams,
    },
    {
      staleTime: 3000, // Los datos no se refetchan durante 3 segundos
    },
  );
};

export type TuseGetDocumentsByCompany = ReturnType<
  typeof useGetDocumentsByCompany
>;
