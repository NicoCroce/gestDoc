import { useURLParams } from '@app/Aplication';
import {
  CertificatesService,
  TCertificatesSearch,
} from '@app/Domains/Certificates';

export const useGetCertificatesByCompany = () => {
  const { searchParams } = useURLParams<TCertificatesSearch>();

  const input =
    (searchParams && {
      ...searchParams,
      type: searchParams?.type ? Number(searchParams?.type) : undefined,
    }) ||
    undefined;

  return CertificatesService.getCertificatesByCompany.useQuery(input, {
    staleTime: 3000, // Los datos no se refetchan durante 3 segundos
    refetchOnWindowFocus: true,
  });
};

export type TuseGetCertificatesByCompany = ReturnType<
  typeof useGetCertificatesByCompany
>;
