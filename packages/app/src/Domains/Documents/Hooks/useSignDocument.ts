import { toast } from 'sonner';
import { documentsService } from '../Documents.service';
import { useCacheDocuments } from './useCacheDocuments';
import { useURLParams } from '@app/Aplication';
import { DOCUMENTS_ROUTE } from '../Documents.routes';
import { TDocumentSearch } from '../Document.entity';

export const useSignDocument = () => {
  const cacheDocuments = useCacheDocuments();
  const { updateParams } = useURLParams<TDocumentSearch>(DOCUMENTS_ROUTE);
  return documentsService.sign.useMutation({
    onSuccess: () => {
      cacheDocuments.invalidate();
      toast.success('Documento firmado');
      updateParams({ id: undefined });
    },
    onError: () =>
      toast.error('La contraseña ingresada no corresponde con la de su cuenta'),
  });
};
