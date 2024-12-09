import { TDataPieChart } from '@app/Aplication/Components/Organisms/PieChart/PieChart';
import { documentsService } from '../Documents.service';

export const useGetStatisticsDocuments = () => {
  const response = documentsService.getStatistics.useQuery();

  const dataChart: TDataPieChart[] = [
    {
      segment: 'validados',
      data: response.data?.validated || 0,
      fill: 'hsl(var(--chart-1))',
    },
    {
      segment: 'pendientes',
      data: response.data?.pending || 0,
      fill: 'hsl(var(--chart-2))',
    },
  ];

  return {
    dataChart,
    ...response,
  };
};
