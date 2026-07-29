import { useState } from 'react';
import { Button } from '@app/Application/Components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@app/Application/Components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@app/Application/Components/ui/popover';
import { Checkbox } from '@app/Application/Components/ui/checkbox';
import { Label } from '@app/Application/Components/ui/label';
import { Container } from '@app/Application';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronDown,
  faLayerGroup,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { cn } from '@app/Application/lib/utils';
import { useGetSegmentTypes } from '../Application/segments.queries';

interface SegmentsFilterProps {
  value: number[];
  onChange: (ids: number[]) => void;
}

export const SegmentsFilter = ({ value, onChange }: SegmentsFilterProps) => {
  const [open, setOpen] = useState(false);
  const { data: segments, isLoading } = useGetSegmentTypes();

  const toggleSegment = (id: number) => {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between',
            value.length > 0 && 'border-primary',
          )}
        >
          <Container row align="center" space="small">
            <FontAwesomeIcon
              icon={faLayerGroup}
              className="size-4 text-muted-foreground"
            />
            <span className="truncate">
              {value.length === 0
                ? 'Filtrar por segmentos'
                : `${value.length} segmento${value.length !== 1 ? 's' : ''} seleccionado${value.length !== 1 ? 's' : ''}`}
            </span>
          </Container>
          <FontAwesomeIcon
            icon={faChevronDown}
            className="ml-2 h-4 w-4 shrink-0 opacity-50"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar segmento..." />
          <CommandList>
            <CommandEmpty>
              {isLoading ? 'Cargando...' : 'No hay segmentos'}
            </CommandEmpty>
            <CommandGroup>
              {segments?.map((seg) => {
                const isSelected = value.includes(seg.id);
                return (
                  <CommandItem
                    key={seg.id}
                    value={seg.nombre}
                    onSelect={() => toggleSegment(seg.id)}
                    className="cursor-pointer"
                  >
                    <Checkbox checked={isSelected} className="mr-2" />
                    <Label className="cursor-pointer flex-1">
                      {seg.nombre}
                    </Label>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
          {value.length > 0 && (
            <div className="border-t p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={() => {
                  onChange([]);
                  setOpen(false);
                }}
              >
                <FontAwesomeIcon icon={faTimes} className="mr-2 size-3" />
                Limpiar filtro
              </Button>
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
};
