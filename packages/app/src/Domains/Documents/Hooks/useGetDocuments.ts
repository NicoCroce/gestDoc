import { useURLParams } from '@app/Aplication';
import { SIGNED, TDocumentSearch } from '../Document.entity';
import { documentsService } from '../Documents.service';

export const useGetDocuments = () => {
  const { searchParams } = useURLParams<TDocumentSearch>();
  return documentsService.getAll.useQuery({
    ...searchParams,
    signed: searchParams?.signed === SIGNED,
  });
};
