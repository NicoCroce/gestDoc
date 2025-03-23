import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@app/Aplication/Components/ui/sheet';
import { ReactNode } from 'react';

interface IFiltersSheet {
  open: boolean;
  closeSheet: () => void;
  children: ReactNode;
  title?: string;
  description?: string;
}

export const FiltersSheet = ({
  open = false,
  closeSheet,
  children,
  description,
  title,
}: IFiltersSheet) => {
  return (
    <Sheet defaultOpen={false} open={open} onOpenChange={closeSheet}>
      <SheetContent>
        {description && title && (
          <SheetHeader className="text-left">
            {title && <SheetTitle>Filtros de Documentos</SheetTitle>}
            {description && (
              <SheetDescription>
                Puedes filtrar los documentos por los siguientes parámetros
              </SheetDescription>
            )}
          </SheetHeader>
        )}
        {children && children}
      </SheetContent>
    </Sheet>
  );
};
