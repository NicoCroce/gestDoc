import { Button, Container, useURLParams } from '@app/Aplication';
import { Input } from '@app/Aplication/Components/ui/input';
import { Label } from '@app/Aplication/Components/ui/label';
import {
  PENDING,
  SIGNED,
  TDocumentSearch,
  TIsSigned,
} from '../../Document.entity';
import { useState } from 'react';
import { SheetClose, SheetFooter } from '@app/Aplication/Components/ui/sheet';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@app/Aplication/Components/ui/toggle-group';

const initialState: TDocumentSearch = {
  title: '',
  signed: PENDING,
};

export const FiltersSheetForm = () => {
  const { searchParams, updateParams } = useURLParams<TDocumentSearch>();
  const [formState, setFormState] = useState<TDocumentSearch>(
    searchParams || initialState,
  );

  const handleChangeFilters = ({
    target: { name, value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleState = (values: string) => {
    setFormState((prev) => ({ ...prev, signed: values as TIsSigned }));
  };

  const handleApplyFilters = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTimeout(() => {
      updateParams(formState);
    }, 300);
  };

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
          value={formState.signed}
        >
          <ToggleGroupItem
            value={PENDING}
            className="data-[state=on]:!bg-primary data-[state=on]:!text-secondary"
          >
            Pendientes
          </ToggleGroupItem>
          <ToggleGroupItem
            value={SIGNED}
            className="data-[state=on]:!bg-primary data-[state=on]:!text-secondary"
          >
            Firmados
          </ToggleGroupItem>
        </ToggleGroup>
      </Container>
      <SheetFooter>
        <SheetClose asChild>
          <Button type="submit">Aplicar filtros</Button>
        </SheetClose>
      </SheetFooter>
    </form>
  );
};
