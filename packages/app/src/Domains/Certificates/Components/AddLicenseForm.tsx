import {
  Button,
  Combobox,
  Container,
  DatePickerWithRange,
  Input,
} from '@app/Aplication';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@app/Aplication/Components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useGetCertificatesTypes } from '../Hooks';
import { useNavigate } from 'react-router-dom';
import { DateRange } from 'react-day-picker';
import { Textarea } from '@app/Aplication/Components/ui/textarea';

export const AddLicenseForm = () => {
  const { data: dataTypes } = useGetCertificatesTypes();
  const navigate = useNavigate();

  const formScheme = z.object({
    reason: z.string(),
    type: z.string(),
    startDate: z.date(),
    endDate: z.date(),
    files: z.array(z.string()),
  });

  const formLicense = useForm<z.infer<typeof formScheme>>({
    resolver: zodResolver(formScheme),
    defaultValues: {
      reason: '',
      type: '',
      startDate: new Date(),
      endDate: new Date(),
      files: [],
    },
  });

  const options = useMemo(() => {
    return dataTypes?.map(({ id, name }) => ({
      value: String(id),
      label: String(name),
    }));
  }, [dataTypes]);

  const hasFiles = formLicense.watch('type') !== '1';

  const handleChangeType = (value: string) => {
    formLicense.setValue('type', value);
  };

  const handleSubmit = (values: z.infer<typeof formScheme>) => {
    console.log(values);
  };

  const handleCancel = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    navigate(-1);
  };

  const handleDate = (date: DateRange) => {
    formLicense.setValue('startDate', date.from!);
    formLicense.setValue('endDate', date.to!);
  };

  return (
    <div>
      <Form {...formLicense}>
        <form onSubmit={formLicense.handleSubmit(handleSubmit)}>
          <Container space="large">
            <FormField
              name="type"
              control={formLicense.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Seleccione el tipo de licencia</FormLabel>
                  <FormControl>
                    <Combobox
                      options={options}
                      value={field.value}
                      onChangeValue={handleChangeType}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              name="endDate"
              control={formLicense.control}
              render={() => (
                <FormItem>
                  <FormLabel>Seleccione rango de fecha de licencia</FormLabel>
                  <FormControl>
                    <DatePickerWithRange onChangeDate={handleDate} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              name="reason"
              control={formLicense.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ingrese descripción de la solicitud</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Escriba el motivo de la solicitud"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            {hasFiles && (
              <FormField
                name="files"
                control={formLicense.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargue el archivo de la licencia</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        className="cursor-pointer"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            <Container row justify="end">
              <Button appearance="cancel" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button type="submit" appearance="save" />
            </Container>
          </Container>
        </form>
      </Form>
    </div>
  );
};
