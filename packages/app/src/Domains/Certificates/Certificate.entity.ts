import { CertificateDTO } from '@server/domains/Certificates';

export interface ICertificate extends CertificateDTO {
  type: string;
}

export type TCertificatesSearch = {
  employee?: string;
  date?: string;
  type?: string;
};
