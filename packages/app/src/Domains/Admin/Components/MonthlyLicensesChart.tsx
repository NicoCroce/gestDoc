import { AreaChartComponent } from '@app/Application/Components';
import { Container } from '@app/Application/Components';
import { Card } from '@app/Application/Components/ui/card';
import { useGetMonthlyStatisticsCertificates } from '../Hooks';

export const MonthlyLicensesChart = () => {
  const { dataChart, year } = useGetMonthlyStatisticsCertificates();

  const total = dataChart.reduce((acc, item) => acc + (item.count || 0), 0);

  return (
    <Card>
      <Container>
        <AreaChartComponent
          chartData={dataChart}
          header={{
            title: 'Licencias cargadas por mes',
            subtitle: `Total de licencias cargadas durante el año ${year}`,
          }}
          footer={{
            title: `${total.toLocaleString()} licencias cargadas en ${year}`,
            subtitle: 'Distribución mensual de licencias registradas',
          }}
        />
      </Container>
    </Card>
  );
};
