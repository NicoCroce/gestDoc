import { useURLParams } from '@app/Aplication';
import { CertificatesService } from '../Certificates.service';
import { TCertificatesSearch } from '../Certificate.entity';

export const useGetCertificates = () => {
  const { searchParams } = useURLParams<TCertificatesSearch>();

  const input =
    (searchParams && {
      ...searchParams,
      type: Number(searchParams?.type) || undefined,
    }) ||
    undefined;

  return CertificatesService.getAll.useQuery(input, {
    staleTime: 3000,
    refetchOnWindowFocus: true,
  });
};
