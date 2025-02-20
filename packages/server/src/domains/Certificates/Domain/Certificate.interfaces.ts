import { IRequestContext } from '@server/Application';
import { Certificate } from './Certificate.entity';

export interface IGetCertificates extends IRequestContext {}
export interface IGetCertificateTypes extends IRequestContext {}

export interface IGetCertificatesResponse {
  [key: number]: Certificate[];
}

export interface ICertificate {
  id: number;
  startDate: Date;
  endDate: Date;
  reason: string;
  type: string;
  files: string[];
}

export interface ICertificateTypes {
  id: number;
  name: string;
  description: string;
}
