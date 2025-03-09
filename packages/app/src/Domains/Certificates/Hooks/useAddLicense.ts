import { toast } from 'sonner';
import { CertificatesService } from '../Certificates.service';
import { z } from 'zod';
import { formSchemeAddLicense } from '../Components/AddLicenseForm';

export const useAddLicense = () => {
  const { mutate, isPending } = CertificatesService.addCertificate.useMutation({
    onError: (_err, _variables) => toast.error('Licencia no agregada'),
    onSuccess: (data) => toast.success(`Licencia agregada ${data.id}`),
  });

  const mutateAddLicence = (data: z.infer<typeof formSchemeAddLicense>) => {
    const { startDate, endDate, type } = data;

    mutate({
      ...data,
      startDate: startDate.toString(),
      endDate: endDate.toString(),
      type: Number(type),
    });
  };

  return {
    mutateAddLicence,
    isPendingAddLicense: isPending,
  };
};
