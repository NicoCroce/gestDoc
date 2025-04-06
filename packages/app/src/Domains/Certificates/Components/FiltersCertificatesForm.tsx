import {
  Button,
  Container,
  DatePicker,
  Input,
  useURLParams,
} from '@app/Aplication';
import { Label } from '@app/Aplication/Components/ui/label';
import { SheetClose, SheetFooter } from '@app/Aplication/Components/ui/sheet';
import { useState } from 'react';
import { TCertificatesSearch } from '../Certificate.entity';
import { useGetCertificatesTypes } from '../Hooks';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@app/Aplication/Components/ui/toggle-group';
import clsx from 'clsx';

const buttonGroupActiveClass =
  'data-[state=on]:!bg-primary data-[state=on]:!text-secondary';

const initialState: TCertificatesSearch = {
  type: undefined,
  date: undefined,
  employee: '',
};

interface FiltersCertificatesFormProps {
  isAdmin?: boolean;
}

export const FiltersCertificatesForm = ({
  isAdmin = false,
}: FiltersCertificatesFormProps) => {
  const { searchParams, updateParams } = useURLParams<TCertificatesSearch>();
  const [formState, setFormState] = useState<TCertificatesSearch>({
    ...initialState,
    ...searchParams,
  });

  const { data: certificatesTypes } = useGetCertificatesTypes();

  const handleChangeFilters = ({
    target: { name, value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleType = (value: string) => {
    setFormState((prev) => ({ ...prev, type: value }));
  };

  const handleApplyFilters = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTimeout(() => {
      updateParams({ ...formState });
    }, 300);
  };

  const onCloseDatePicker = (date: Date) => {
    setFormState((prev) => ({ ...prev, date: date.toISOString() }));
  };

  const cleanFilters = () => setFormState({ ...initialState });

  return (
    <form className="grid gap-4 py-4" onSubmit={handleApplyFilters}>
      {isAdmin && (
        <Container>
          <Label htmlFor="employee">Nombre</Label>
          <Input
            id="employee"
            name="employee"
            value={formState.employee}
            className="col-span-3"
            onChange={handleChangeFilters}
          />
        </Container>
      )}
      <Container>
        <Label>Tipo</Label>
        <ToggleGroup
          type="single"
          variant="outline"
          className="justify-start gap-4 flex-wrap"
          onValueChange={handleType}
          value={formState.type}
        >
          {certificatesTypes?.map(({ name, id }) => (
            <ToggleGroupItem
              key={id}
              value={String(id)}
              className={clsx('capitalize', buttonGroupActiveClass)}
            >
              {name}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </Container>
      <Container>
        <Label>Fecha</Label>
        <DatePicker onClose={onCloseDatePicker} value={searchParams?.date} />
      </Container>
      <SheetFooter className="mt-16">
        <Container row className="justify-end">
          <Button variant="outline" onClick={cleanFilters}>
            Limpiar filtros
          </Button>
          <SheetClose asChild>
            <Button type="submit">Aplicar filtros</Button>
          </SheetClose>
        </Container>
      </SheetFooter>
    </form>
  );
};
