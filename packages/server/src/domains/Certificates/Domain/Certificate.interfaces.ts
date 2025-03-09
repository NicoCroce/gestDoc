import { IRequestContext } from '@server/Application';
import { Certificate } from './Certificate.entity';
import { CertificateTypes } from './CertificateTypes.entity';

export interface IGetCertificates extends IRequestContext {}
export interface IGetCertificateTypes extends IRequestContext {}
export interface IAddCertificate extends IRequestContext {
  input: Omit<ICertificate, 'id' | 'type'> & { type: number };
}

// Retorna un array ordenado por año, es decir que unifica todas las licencias de ese año en una key.
export interface IGetCertificatesResponse {
  [key: number]: Certificate[];
}

export interface IAppendImages extends IRequestContext {
  input: {
    file?: Express.Multer.File;
    protocol: string;
    host: string;
  };
}
export interface IAppendImagesResponse {
  message: string;
  fileData: Express.Multer.File;
  fileUrl: string;
}

export interface ICertificate {
  id?: number;
  startDate: Date;
  endDate: Date;
  reason: string;
  type: CertificateTypes;
  files?: string[];
}

export interface ICertificateTypes {
  id: number;
  name?: string;
  description?: string;
}
