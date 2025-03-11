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
import { useGetCertificatesTypes } from '../../Hooks';
import { useNavigate } from 'react-router-dom';
import { DateRange } from 'react-day-picker';
import { Textarea } from '@app/Aplication/Components/ui/textarea';
import { useAddLicense } from '../../Hooks/useAddLicense';
import { CERTIFICATES_ROUTES } from '../../Certificates.routes';
import { formSchemeAddLicense } from './AddLicenceScheme';

export const AddLicenseForm = () => {
  const { data: dataTypes } = useGetCertificatesTypes();
  const navigate = useNavigate();
  const { mutateAddLicence, isPendingAddLicense, appendFiles } =
    useAddLicense();

  const formLicense = useForm<z.infer<typeof formSchemeAddLicense>>({
    resolver: zodResolver(formSchemeAddLicense),
    defaultValues: {
      reason: undefined,
      type: '',
      startDate: undefined,
      endDate: undefined,
      files: undefined,
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

  const handleSubmit = async (values: z.infer<typeof formSchemeAddLicense>) => {
    console.log(values);
    const { id } = await mutateAddLicence(values);
    if (values.files) await appendFiles(id, values.files);
    navigate(CERTIFICATES_ROUTES);
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
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>Cargue el archivo de la licencia</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        className="cursor-pointer"
                        onChange={(e) => onChange(e.target.files)}
                        {...fieldProps}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            <Container row justify="end">
              <Button
                appearance="cancel"
                onClick={handleCancel}
                disabled={isPendingAddLicense}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                appearance="save"
                disabled={isPendingAddLicense}
              />
            </Container>
          </Container>
        </form>
      </Form>
    </div>
  );
};
