import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CertificatesService } from '../Certificates.service';
import { CertificateStatus } from '@server/domains/Certificates/Domain/Certificate.types';
import { TRPCClientErrorLike } from '@trpc/client';
import { TCertificatesRouter } from '@server/domains/Certificates';

type CertificatesRouterError = TRPCClientErrorLike<TCertificatesRouter>;

export const useUpdateCertificateStatus = () => {
  const queryClient = useQueryClient();
  const { mutate, isPending } =
    CertificatesService.updateCertificateStatus.useMutation({
      onError: (err: CertificatesRouterError) => toast.error(err.message),
      onSuccess: () => {
        toast.success('Estado actualizado');
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

  const mutateUpdate = (
    id: number,
    status: CertificateStatus,
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      mutate(
        { id, status },
        {
          onSuccess: () => resolve(),
          onError: (error: CertificatesRouterError) => reject(error),
        },
      );
    });
  };

  return { mutateUpdate, isPending };
};
