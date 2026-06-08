import { Container, PieChartComponent } from '@app/Application/Components';
import { Card } from '@app/Application/Components/ui/card';
import { useGetStatisticsCertificates } from '../Hooks';

export const StatisticsCertificates = () => {
  const {
    dataChartTotalActivas,
    data: statistics,
    dataChartTypes,
    dataChartEmployess,
  } = useGetStatisticsCertificates();

  return (
    <Card>
      <Container className="md:flex-row" justify="between">
        <PieChartComponent
          chartData={dataChartTotalActivas}
          total={statistics?.actives || 0}
          header={{
            title: 'Cantidad de licencias activas',
          }}
          footer={{
            title: 'Puedes utilizar los filtros para más detalles',
          }}
          labelCenter="Certificados"
        />
        <PieChartComponent
          chartData={dataChartTypes}
          total={dataChartTypes.length || 0}
          header={{
            title: 'Cantidad de licencias por tipo',
          }}
          footer={{
            title: 'Puedes utilizar los filtros para más detalles',
          }}
          labelCenter="Tipos"
        />
        <PieChartComponent
          chartData={dataChartEmployess}
          total={dataChartEmployess.length || 0}
          header={{
            title: 'Empleados con licencias',
          }}
          footer={{
            title: 'Puedes utilizar los filtros para más detalles',
          }}
          labelCenter="Empleado/s"
        />
      </Container>
    </Card>
  );
};
