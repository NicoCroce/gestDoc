import { toast } from 'sonner';
import { documentsService } from '../Documents.service';
import { useCacheDocuments } from './useCacheDocuments';

export const useSignDocument = () => {
  const cacheDocuments = useCacheDocuments();
  return documentsService.sign.useMutation({
    onSuccess: () => {
      cacheDocuments.invalidate();
      toast.success('Documento firmado');
    },
    onError: () =>
      toast.error('La contraseña ingresada no corresponde con la de su cuenta'),
  });
};
