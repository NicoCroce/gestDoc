import { CertificatesService } from '@app/Domains/Certificates';

const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export type TMonthlyLicensesByType = {
  name: string;
  count: number;
};

export type TMonthlyLicensesData = {
  month: string;
  count: number;
  byType: TMonthlyLicensesByType[];
};

export const useGetMonthlyStatisticsCertificates = () => {
  const response = CertificatesService.getStatisticsMonthly.useQuery();

  const dataChart: TMonthlyLicensesData[] =
    response.data?.months.map(({ month, count, byType }) => ({
      month: MONTH_NAMES[month - 1] ?? String(month),
      count,
      byType,
    })) ?? [];

  return {
    dataChart,
    year: response.data?.year ?? new Date().getFullYear(),
    ...response,
  };
};
