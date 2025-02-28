export interface CertificateDTO {
  id: number;
  startDate: string;
  endDate: string;
  reason: string;
  type: string;
  files: string[];
}

export interface IGetCertificatesDTO {
  [key: number]: CertificateDTO[];
}
