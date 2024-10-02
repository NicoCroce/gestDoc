import { documentsTypesService } from '../Documents.service';

export const useGetDocumentsTypes = () => {
  return documentsTypesService.getAll.useQuery();
};
