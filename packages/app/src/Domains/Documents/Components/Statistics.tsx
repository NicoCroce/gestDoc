import {
  Container,
  PieChartComponent,
  Title,
} from '@app/Aplication/Components';
import { Badge } from '@app/Aplication/Components/ui/badge';
import { Card } from '@app/Aplication/Components/ui/card';
import { useGetStatisticsDocuments } from '../Hooks';

export const Statistics = () => {
  const { dataChart, data: statistics } = useGetStatisticsDocuments();
  return (
    <Card>
      <Container className="md:flex-row justify-around">
        <PieChartComponent
          chartData={dataChart}
          total={statistics?.total || 0}
          header={{
            title: 'Estado de todos los documentos',
            subtitle: 'Documentos hasta la actualidad',
          }}
          footer={{
            title: 'Puedes utilizar los filtros para más detalles',
          }}
        />
        <Container justify="center" className="p-4">
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
        </Container>
      </Container>
    </Card>
  );
};
