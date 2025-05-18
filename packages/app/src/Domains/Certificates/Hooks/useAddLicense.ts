import { toast } from 'sonner';
import { CertificatesService } from '../Certificates.service';
import { z } from 'zod';
import { formSchemeAddLicense } from '../Components/AddLicenseForm';
import ApiService from '@app/Infrastructure/Services/AxiosApi';
import { ICertificate } from '../Certificate.entity';

export const useAddLicense = () => {
  const { mutate, isPending } = CertificatesService.addCertificate.useMutation({
    onError: (_err, _variables) => toast.error('Licencia no agregada'),
    onSuccess: (data) => {
      toast.success('Licencia agregada');
      return data;
    },
  });

  const mutateAddLicence = (
    data: z.infer<typeof formSchemeAddLicense>,
  ): Promise<ICertificate> => {
    const { startDate, endDate, type } = data;

    // Crear una promesa que se resolverá con los datos de la respuesta
    return new Promise((resolve, reject) => {
      mutate(
        {
          ...data,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          type: Number(type),
        },
        {
          onSuccess: (responseData) => {
            // Resolver la promesa con los datos de la respuesta
            resolve(responseData);
          },
          onError: (error) => {
            // Rechazar la promesa con el error
            reject(error);
          },
        },
      );
    });
  };

  const appendFiles = async (id: number, files: FileList) => {
    const formData = new FormData();

    // Añadir múltiples archivos
    /* if (files && files instanceof FileList) {
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }
    } */

    formData.append('file', files[0]);

    toast.info('Cargando imágnes');

    try {
      await ApiService.uploadFile(`/express/load/${id}`, formData);
      toast.success(`Imágenes cargadas correctamente`);
    } catch {
      toast.error(`Imágenes no cargadas`);
    }
  };

  return {
    mutateAddLicence,
    isPendingAddLicense: isPending,
    appendFiles,
  };
};
