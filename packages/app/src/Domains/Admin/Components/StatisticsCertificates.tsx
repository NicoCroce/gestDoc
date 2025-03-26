import { Container, PieChartComponent } from '@app/Aplication/Components';
import { Card } from '@app/Aplication/Components/ui/card';
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
      <Container className="md:flex-row justify-around">
        <PieChartComponent
          chartData={dataChartTotalActivas}
          total={statistics?.total || 0}
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
        {/*  <Container justify="center" className="p-4">
          <Container className="grid grid-cols-[auto,100px] gap-4 justify-center">
            <Title variant="h4">Total de Documentos:</Title>
            <Badge variant="secondary" className="justify-center">
              {statistics?.total}
            </Badge>

            <Title variant="h4">Documentos pendientes:</Title>
            <Badge variant="secondary" className="justify-center">
              {statistics?.pending}
            </Badge>

            <Title variant="h4">Documentos validados:</Title>
            <Badge variant="secondary" className="justify-center">
              {statistics?.validated}
            </Badge>
          </Container>
        </Container> */}
      </Container>
    </Card>
  );
};
