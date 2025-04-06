import { Button, Container, useURLParams } from '@app/Aplication';
import { Input } from '@app/Aplication/Components/ui/input';
import { Label } from '@app/Aplication/Components/ui/label';
import {
  PENDING,
  VALIDATED,
  TDocumentSearch,
  TStateDocument,
} from '../../Document.entity';
import { useState } from 'react';
import { SheetClose, SheetFooter } from '@app/Aplication/Components/ui/sheet';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@app/Aplication/Components/ui/toggle-group';
import { useGetDocumentsTypes } from '../../Hooks/useGetDocumentsTypes';
import clsx from 'clsx';

const initialState: TDocumentSearch = {
  title: '',
  state: PENDING,
  type: '',
};

const buttonGroupActiveClass =
  'data-[state=on]:!bg-primary data-[state=on]:!text-secondary';

export const FiltersDocumentsForm = () => {
  const { searchParams, updateParams } = useURLParams<TDocumentSearch>();
  const [formState, setFormState] = useState<TDocumentSearch>({
    ...initialState,
    ...searchParams,
  });
  const { data: documentsTypes } = useGetDocumentsTypes();

  const handleChangeFilters = ({
    target: { name, value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleState = (value: string) => {
    setFormState((prev) => ({ ...prev, state: value as TStateDocument }));
  };

  const handleType = (value: string) => {
    setFormState((prev) => ({ ...prev, type: value }));
  };

  const handleApplyFilters = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTimeout(() => {
      updateParams({ ...formState, id: undefined });
    }, 300);
  };

  const cleanFilters = () => setFormState(initialState);

  return (
    <form className="grid gap-4 py-4" onSubmit={handleApplyFilters}>
      <Container>
        <Label htmlFor="title">Nombre</Label>
        <Input
          id="title"
          name="title"
          value={formState.title}
          className="col-span-3"
          onChange={handleChangeFilters}
        />
      </Container>
      <Container>
        <Label>Estado</Label>
        <ToggleGroup
          type="single"
          variant="outline"
          className="justify-start gap-4"
          onValueChange={handleState}
          value={formState.state}
        >
          <ToggleGroupItem value={PENDING} className={buttonGroupActiveClass}>
            Pendientes
          </ToggleGroupItem>
          <ToggleGroupItem value={VALIDATED} className={buttonGroupActiveClass}>
            Validados
          </ToggleGroupItem>
        </ToggleGroup>
      </Container>
      <Container>
        <Label>Tipo</Label>
        <ToggleGroup
          type="single"
          variant="outline"
          className="justify-start gap-4 flex-wrap"
          onValueChange={handleType}
          value={formState.type}
        >
          {documentsTypes?.map((docType) => (
            <ToggleGroupItem
              key={docType.id}
              value={docType.denominacion}
              className={clsx('capitalize', buttonGroupActiveClass)}
            >
              {docType.denominacion}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
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
