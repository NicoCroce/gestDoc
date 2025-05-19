import {
  Control,
  FieldValues,
  Path,
  PathValue,
  UseFormReturn,
} from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../ui/form';
import { DatePickerWithRange } from './DatePickerWithRange';
import { DateRange as DT } from 'react-day-picker';
import { useDevice } from '@app/Aplication/Hooks';
import { Input } from '../Input';
import { Container } from '../../Layout';

interface DateRangeProps<T extends FieldValues> {
  nameStartDate: Path<T>;
  nameEndDate: Path<T>;
  control: Control<T>;
  label: string;
  form: UseFormReturn<T>;
}

export const DateRange = <T extends FieldValues>({
  control,
  nameStartDate,
  nameEndDate,
  form,
}: DateRangeProps<T>) => {
  const { isMobile } = useDevice();

  const startDate = form.watch(nameStartDate);

  const handleDate = (date: DT) => {
    form.setValue(nameStartDate, date.from! as PathValue<T, Path<T>>);
    form.setValue(nameEndDate, date.to! as PathValue<T, Path<T>>);
  };

  return (
    <>
      {isMobile ? (
        <Container>
          <Container row justify="between">
            <FormField
              name={nameStartDate}
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de inicio</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name={nameEndDate}
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de fin</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      disabled={startDate === undefined}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Container>
        </Container>
      ) : (
        <FormField
          name={nameEndDate}
          control={control}
          render={() => (
            <FormItem>
              <FormLabel>Seleccione rango de fecha de licencia</FormLabel>
              <FormControl>
                <DatePickerWithRange onChangeDate={handleDate} />
              </FormControl>
            </FormItem>
          )}
        />
      )}
    </>
  );
};
