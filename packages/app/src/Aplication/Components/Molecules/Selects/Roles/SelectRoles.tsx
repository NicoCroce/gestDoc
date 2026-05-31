import { FieldPath, FieldValues, UseFormReturn } from 'react-hook-form';
import { SelectBase } from '../SelectBase';
import { useGetRoles } from '@app/Domains/Auth';
import { IRoles } from '@server/domains/Permissions';
import { useMemo } from 'react';

interface SelectRolesProps<T extends FieldValues, TName extends FieldPath<T>> {
  name: TName;
  form: UseFormReturn<T>;
}

export const SelectRoles = <T extends FieldValues, TName extends FieldPath<T>>({
  name,
  form,
}: SelectRolesProps<T, TName>) => {
  const { data, isLoading } = useGetRoles();

  const options = useMemo(
    () =>
      data?.map(({ name }: IRoles) => ({
        value: name,
        label: `${name}`,
      })),
    [data],
  );

  return (
    <SelectBase
      form={form}
      name={name}
      inputLabel="Rol"
      options={options}
      isLoading={isLoading}
    />
  );
};
