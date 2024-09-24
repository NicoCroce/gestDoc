import { Button, Container, useURLParams } from '@app/Aplication';
import { Input } from '@app/Aplication/Components/ui/input';
import { Label } from '@app/Aplication/Components/ui/label';
import {
  ACCORDANCE,
  PENDING,
  RECEIPT,
  VALIDATED,
  TDocumentSearch,
  TIsSigned,
  VACATIONS,
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
  type: '',
};

const buttonGroupActiveClass =
  'data-[state=on]:!bg-primary data-[state=on]:!text-secondary';

export const FiltersSheetForm = () => {
  const { searchParams, updateParams } = useURLParams<TDocumentSearch>();
  const [formState, setFormState] = useState<TDocumentSearch>({
    ...initialState,
    ...searchParams,
  });

  const handleChangeFilters = ({
    target: { name, value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSigned = (value: string) => {
    setFormState((prev) => ({ ...prev, signed: value as TIsSigned }));
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
          autoFocus
        />
      </Container>
      <Container>
        <Label>Estado</Label>
        <ToggleGroup
          type="single"
          variant="outline"
          className="justify-start gap-4"
          onValueChange={handleSigned}
          value={formState.signed}
        >
          <ToggleGroupItem value={PENDING} className={buttonGroupActiveClass}>
            Pendientes
          </ToggleGroupItem>
          <ToggleGroupItem value={VALIDATED} className={buttonGroupActiveClass}>
            Firmados
          </ToggleGroupItem>
        </ToggleGroup>
      </Container>
      <Container>
        <Label>Tipo</Label>
        <ToggleGroup
          type="single"
          variant="outline"
          className="justify-start gap-4"
          onValueChange={handleType}
          value={formState.type}
        >
          <ToggleGroupItem value={RECEIPT} className={buttonGroupActiveClass}>
            Recibos
          </ToggleGroupItem>
          <ToggleGroupItem value={VACATIONS} className={buttonGroupActiveClass}>
            Vacaciones
          </ToggleGroupItem>
          <ToggleGroupItem
            value={ACCORDANCE}
            className={buttonGroupActiveClass}
          >
            Conformidad
          </ToggleGroupItem>
        </ToggleGroup>
      </Container>

      <SheetFooter className="mt-16">
        <Container row>
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
