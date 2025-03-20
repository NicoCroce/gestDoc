import { ICertificate } from '../../Domain';

export interface CertificateDTO {
  id: number;
  startDate: string;
  endDate: string;
  reason: string;
  type: string;
  files?: string[];
}

export interface IGetCertificatesDTO {
  [key: number]: CertificateDTO[];
}

export interface IGetCertificatesByCompanyDTO {
  [userId: number]: {
    user: string;
    certificates: (Omit<ICertificate, 'type' | 'id'> & {
      type: string;
      id: number;
    })[];
  };
}
