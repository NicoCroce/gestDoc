import { useURLParams } from '@app/Aplication';
import { TDocumentSearch, VALIDATED } from '../Document.entity';
import { documentsService } from '../Documents.service';

export const useGetDocuments = () => {
  const { searchParams } = useURLParams<TDocumentSearch>();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, ...filterSearchParams } = searchParams || {};

  console.log(filterSearchParams);

  return documentsService.getAll.useQuery({
    ...filterSearchParams,
    validated: searchParams?.state === VALIDATED,
  });
};
