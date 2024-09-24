import { useURLParams } from '@app/Aplication';
import { VALIDATED, TDocumentSearch } from '../Document.entity';
import { documentsService } from '../Documents.service';

export const useGetDocuments = () => {
  const { searchParams } = useURLParams<TDocumentSearch>();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, ...filterSearchParams } = searchParams || {};
  return documentsService.getAll.useQuery({
    ...filterSearchParams,
    signed: filterSearchParams?.signed === VALIDATED,
  });
};
