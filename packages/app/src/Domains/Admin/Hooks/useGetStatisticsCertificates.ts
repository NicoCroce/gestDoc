import { TDataPieChart } from '@app/Aplication/Components/Organisms/PieChart/PieChart';
import { CertificatesService } from '@app/Domains/Certificates';

export const useGetStatisticsCertificates = () => {
  const response = CertificatesService.getStatistics.useQuery();

  const dataChartTotalActivas: TDataPieChart[] = [
    {
      segment: 'activas',
      data: response.data?.actives || 0,
      fill: 'hsl(var(--chart-1))',
    },
    {
      segment: 'total',
      data: response.data?.total || 0,
      fill: 'hsl(var(--chart-2))',
    },
  ];

  const dataChartTypes: TDataPieChart[] =
    response.data?.types.map(({ name, count }, index) => {
      console.log(name);
      return {
        segment: name,
        data: count || 0,
        fill: `hsl(${(index * 20) % 320}, 70%, 50%)`,
      };
    }) || [];

  const dataChartEmployess: TDataPieChart[] =
    response.data?.employees.map(({ user, count }, index) => {
      return {
        segment: user,
        data: count || 0,
        fill: `hsl(${(index * 20) % 320}, 70%, 50%)`,
      };
    }) || [];

  return {
    dataChartTotalActivas,
    dataChartEmployess,
    dataChartTypes,
    ...response,
  };
};
