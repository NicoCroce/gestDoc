import {
  Button,
  Combobox,
  Container,
  Input,
  InputField,
} from '@app/Application';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@app/Application/Components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { useGetCertificatesTypes } from '../../Hooks';
import { useNavigate } from 'react-router-dom';
import { Textarea } from '@app/Application/Components/ui/textarea';
import { useAddLicense } from '../../Hooks/useAddLicense';
import { CERTIFICATES_ROUTES } from '../../Certificates.routes';
import { TCertificateType } from '../../Certificate.entity';
import { formSchemeAddLicense } from './AddLicenceScheme';
import { SelectField } from '@app/Application/Components/Molecules/FormFields/SelectField';
import { DateRange } from '@app/Application/Components/Molecules/DateRange/';

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
      startDate: '',
      endDate: '',
      files: undefined,
    },
  });

  const options = useMemo(() => {
    return dataTypes?.map(({ id, name }: TCertificateType) => ({
      value: String(id),
      label: String(name),
    }));
  }, [dataTypes]);

  const licenseType = useWatch({ control: formLicense.control, name: 'type' });
  const hasFiles = licenseType !== '1';

  const handleChangeType = (value: string) => {
    formLicense.setValue('type', value);
  };

  const handleSubmit = async (values: z.infer<typeof formSchemeAddLicense>) => {
    const { id } = await mutateAddLicence(values);
    if (values.files) await appendFiles(id, values.files);
    navigate(CERTIFICATES_ROUTES);
  };

  const handleCancel = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    navigate(-1);
  };

  return (
    <div>
      <Form {...formLicense}>
        <form onSubmit={formLicense.handleSubmit(handleSubmit)}>
          <Container space="large">
            <SelectField
              control={formLicense.control}
              name="type"
              label="Seleccione el tipo de licencia"
              combobox={
                <Combobox options={options} onChangeValue={handleChangeType} />
              }
            ></SelectField>

            <DateRange
              form={formLicense}
              nameStartDate="startDate"
              nameEndDate="endDate"
              label="Seleccione rango de fecha de licencia"
            />

            <InputField
              control={formLicense.control}
              label="Ingrese descripción de la solicitud"
              name="reason"
            >
              <Textarea placeholder="Escriba el motivo de la solicitud" />
            </InputField>

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
