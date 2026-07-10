import { CertificateTypes } from './CertificateTypes.entity';

export interface ICertificate {
  id?: number;
  startDate: Date;
  endDate: Date;
  reason: string;
  type: CertificateTypes;
  files?: string[];
  userId?: number;
}

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

export interface IMonthlyStatisticByType {
  name: string;
  count: number;
}

export interface IMonthlyStatistic {
  month: number; // 1-12
  count: number;
  byType: IMonthlyStatisticByType[];
}

export interface IGetMonthlyStatisticsCertificatesResponse {
  year: number;
  months: IMonthlyStatistic[];
  availableYears: number[];
}
