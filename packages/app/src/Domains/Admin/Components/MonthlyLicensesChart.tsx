import { useState } from 'react';
import {
  AreaChartComponent,
  TDataAreaChart,
} from '@app/Application/Components';
import { Container } from '@app/Application/Components';
import { Card } from '@app/Application/Components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@app/Application/Components/ui/select';
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
  const [selectedYear, setSelectedYear] = useState<number | undefined>();
  const { dataChart, year, availableYears, isLoading } =
    useGetMonthlyStatisticsCertificates(selectedYear);

  const total = dataChart.reduce((acc, item) => acc + (item.count || 0), 0);

  return (
    <Card>
      <Container>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 pt-6">
          <div>
            <h3 className="text-lg font-semibold leading-none tracking-tight">
              Licencias por mes
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Total de licencias durante el año {year}
            </p>
          </div>
          <Select
            value={String(year)}
            onValueChange={(value) => setSelectedYear(Number(value))}
            disabled={isLoading || availableYears.length === 0}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Año" />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map((availableYear) => (
                <SelectItem key={availableYear} value={String(availableYear)}>
                  {availableYear}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <AreaChartComponent
          chartData={dataChart as TDataAreaChart[]}
          footer={{
            title: `${total.toLocaleString()} licencias en ${year}`,
            subtitle: 'Distribución mensual de licencias',
          }}
          tooltipContent={<MonthlyLicensesChartTooltip />}
        />
      </Container>
    </Card>
  );
};
