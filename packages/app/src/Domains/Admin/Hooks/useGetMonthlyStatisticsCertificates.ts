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

export type TMonthlyLicensesData = {
  month: string;
  count: number;
};

export const useGetMonthlyStatisticsCertificates = () => {
  const response = CertificatesService.getStatisticsMonthly.useQuery();

  const dataChart: TMonthlyLicensesData[] =
    response.data?.months.map(({ month, count }) => ({
      month: MONTH_NAMES[month - 1] ?? String(month),
      count,
    })) ?? [];

  return {
    dataChart,
    year: response.data?.year ?? new Date().getFullYear(),
    ...response,
  };
};
