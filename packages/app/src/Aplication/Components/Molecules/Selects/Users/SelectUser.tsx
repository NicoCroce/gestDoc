import { FieldPath, FieldValues, UseFormReturn } from 'react-hook-form';
import { useGetUsers } from './Hooks/useGetUsers';
import { SelectBase } from '../SelectBase';
interface SelectUserProps<T extends FieldValues, TName extends FieldPath<T>> {
  name: TName;
  form: UseFormReturn<T>;
}

export const SelectUser = <T extends FieldValues, TName extends FieldPath<T>>({
  name,
  form,
}: SelectUserProps<T, TName>) => {
  const { data: UserOptions, isLoading } = useGetUsers();

  return (
    <SelectBase
      form={form}
      name={name}
      inputLabel="Usuarios"
      options={UserOptions}
      isLoading={isLoading}
      isBig={false}
    />
  );
};
