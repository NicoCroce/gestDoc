import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@app/Aplication/Components/ui/sheet';
import { FiltersSheetForm } from './FiltersSheet.form';

interface IFiltersSheet {
  open: boolean;
  closeSheet: () => void;
}

export const FiltersSheet = ({ open = false, closeSheet }: IFiltersSheet) => {
  return (
    <Sheet defaultOpen={false} open={open} onOpenChange={closeSheet}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filtros de Documentos</SheetTitle>
          <SheetDescription>
            Puedes filtrar los documentos por los siguientes parámetros
          </SheetDescription>
        </SheetHeader>
        <FiltersSheetForm />
      </SheetContent>
    </Sheet>
  );
};
