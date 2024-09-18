import { documentsService } from '../Documents.service';

export const useGetDocuments = () => {
  return documentsService.getAll.useQuery();
};
