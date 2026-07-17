import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CertificatesService } from '../Certificates.service';
import { TRPCClientErrorLike } from '@trpc/client';
import { TCertificatesRouter } from '@server/domains/Certificates';

type CertificatesRouterError = TRPCClientErrorLike<TCertificatesRouter>;

export const useDeleteCertificate = () => {
  const queryClient = useQueryClient();
  const { mutate, isPending } =
    CertificatesService.deleteCertificate.useMutation({
      onError: (err: CertificatesRouterError) => toast.error(err.message),
      onSuccess: () => {
        toast.success('Licencia eliminada');
        queryClient.invalidateQueries({ queryKey: ['certificates'] });
        queryClient.invalidateQueries({ queryKey: ['certificatesYears'] });
        queryClient.invalidateQueries({
          queryKey: ['certificatesYears', 'admin'],
        });
        queryClient.invalidateQueries({
          queryKey: ['certificates', 'getCertificatesByCompany'],
        });
      },
    });

  const mutateDelete = (id: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      mutate(
        { id },
        {
          onSuccess: () => resolve(),
          onError: (error: CertificatesRouterError) => reject(error),
        },
      );
    });
  };

  return { mutateDelete, isPending };
};
