import { inferRouterOutputs } from '@trpc/server';
import { TCertificatesRouter } from '@server/domains/Certificates';

type TCertificatesOutput = inferRouterOutputs<TCertificatesRouter>;

export type ICertificate =
  TCertificatesOutput['certificates']['addCertificate'];
export type TCertificateType =
  TCertificatesOutput['certificates']['getCertificateTypes'][number];

export type TCertificatesSearch = {
  employee?: string;
  date?: string;
  type?: string;
};
