import { CertificatesService } from '@app/Domains/Certificates';

export const useGetCertificatesByCompany = () =>
  CertificatesService.getCertificatesByCompany.useQuery(undefined, {
    staleTime: 3000, // Los datos no se refetchan durante 3 segundos
  });

export type TuseGetCertificatesByCompany = ReturnType<
  typeof useGetCertificatesByCompany
>;
