import { CertificateDTO } from '@server/domains/Certificates';

export interface ICertificate extends CertificateDTO {
  type: string;
}
