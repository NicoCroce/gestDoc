import { IRequestContext } from '@server/Application';
import { Certificate } from './Certificate.entity';
import { CertificateTypes } from './CertificateTypes.entity';

interface IFilters {
  input?: {
    employee?: string;
    date?: Date;
    type?: number;
  };
}

export interface IGetCertificates extends IRequestContext, IFilters {}
export interface IGetCertificatesCompany extends IRequestContext, IFilters {}
export interface IGetCertificateTypes extends IRequestContext {}
export interface IAddCertificate extends IRequestContext {
  input: Omit<ICertificate, 'id' | 'type'> & { type: number };
}

export interface IGetStatisticsCertificates extends IRequestContext {}
export interface IGetStatisticsCertificatesResponse {
  total: number;
  actives: number;
  types: {
    name: string;
    count: number;
  }[];
  employees: {
    user: string;
    count: number;
  }[];
}

// Retorna un array ordenado por año, es decir que unifica todas las licencias de ese año en una key.
export interface IGetCertificatesResponse {
  [key: number]: Certificate[];
}

export interface IGetCertificatesByCompanyResponse {
  [userId: number]: {
    user: string;
    certificates: {
      [year: number]: Certificate[];
    };
  };
}

export interface IAppendImages extends IRequestContext {
  input: {
    file?: Express.Multer.File;
    protocol: string;
    host: string;
    id: number;
  };
}

export interface ICertificate {
  id?: number;
  startDate: Date;
  endDate: Date;
  reason: string;
  type: CertificateTypes;
  files?: string[];
  userId?: number;
}

export interface ICertificateTypes {
  id: number;
  name?: string;
  description?: string;
}
