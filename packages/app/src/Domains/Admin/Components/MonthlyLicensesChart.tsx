import {
  AreaChartComponent,
  TDataAreaChart,
} from '@app/Application/Components';
import { Container } from '@app/Application/Components';
import { Card } from '@app/Application/Components/ui/card';
import { TooltipProps } from 'recharts';
import {
  useGetMonthlyStatisticsCertificates,
  TMonthlyLicensesData,
  TMonthlyLicensesByType,
} from '../Hooks';

type TMonthlyLicensesChartTooltipProps = TooltipProps<number, string> & {
  payload?: Array<{
    payload: TMonthlyLicensesData;
    value: number;
  }>;
};

const MonthlyLicensesChartTooltip = ({
  active,
  payload,
  label,
}: TMonthlyLicensesChartTooltipProps) => {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;
  const total = data.count;
  const byType = data.byType || [];

  return (
    <div className="rounded-lg border border-border/50 bg-background p-3 shadow-md">
      <div className="mb-2 border-b border-border pb-2">
        <p className="font-medium text-sm">{label}</p>
        <p className="text-lg font-bold text-primary">{total} licencias</p>
      </div>
      {byType.length > 0 && (
        <div className="space-y-1">
          {byType.map((type: TMonthlyLicensesByType) => (
            <div
              key={type.name}
              className="flex items-center justify-between gap-4 text-xs"
            >
              <span className="text-muted-foreground">{type.name}</span>
              <span className="font-mono font-medium">{type.count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const MonthlyLicensesChart = () => {
  const { dataChart, year } = useGetMonthlyStatisticsCertificates();

  const total = dataChart.reduce((acc, item) => acc + (item.count || 0), 0);

  return (
    <Card>
      <Container>
        <AreaChartComponent
          chartData={dataChart as TDataAreaChart[]}
          header={{
            title: 'Licencias cargadas por mes',
            subtitle: `Total de licencias cargadas durante el año ${year}`,
          }}
          footer={{
            title: `${total.toLocaleString()} licencias cargadas en ${year}`,
            subtitle: 'Distribución mensual de licencias registradas',
          }}
          tooltipContent={<MonthlyLicensesChartTooltip />}
        />
      </Container>
    </Card>
  );
};
