import { CertificatesService } from '../Certificates.service';

export const useGetCertificates = () => {
  return CertificatesService.getAll.useQuery(undefined, {
    staleTime: 1 * 60,
    refetchOnWindowFocus: true,
  });
};
