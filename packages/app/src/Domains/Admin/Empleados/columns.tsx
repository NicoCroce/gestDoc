import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@app/Application/Components/ui/badge';
import { Checkbox } from '@app/Application/Components/ui/checkbox';

export interface IEmployeeRecord {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  renovar_clave: boolean;
  estado_firma: 'Pendiente' | 'Firmado' | 'Corrupto';
}

interface EmployeeColumnsOptions {
  selectionMode: boolean;
  selectedIds: Set<number>;
  onToggleSelection: (id: number) => void;
  onToggleAll: () => void;
}

export const employeeColumns = (
  options: EmployeeColumnsOptions,
): ColumnDef<IEmployeeRecord>[] => {
  const { selectionMode, selectedIds, onToggleSelection, onToggleAll } =
    options;

  const columns: ColumnDef<IEmployeeRecord>[] = [];

  if (selectionMode) {
    columns.push({
      id: 'select',
      header: () => (
        <Checkbox
          checked={selectedIds.size > 0}
          onCheckedChange={() => onToggleAll()}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedIds.has(row.original.id)}
          onCheckedChange={() => onToggleSelection(row.original.id)}
        />
      ),
    });
  }

  columns.push(
    {
      accessorKey: 'apellido',
      header: 'Apellido',
      cell: ({ row }) => row.getValue('apellido'),
    },
    {
      accessorKey: 'nombre',
      header: 'Nombre',
      cell: ({ row }) => row.getValue('nombre'),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.getValue('email')}
        </span>
      ),
    },
    {
      accessorKey: 'renovar_clave',
      header: 'Renovar clave',
      cell: ({ row }) => {
        const needsRenewal = row.getValue('renovar_clave') as boolean;
        return (
          <Badge variant={needsRenewal ? 'secondary' : 'default'}>
            {needsRenewal ? 'Debe renovar' : 'OK'}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'estado_firma',
      header: 'Acepto términos',
      cell: ({ row }) => {
        const estado = row.getValue('estado_firma') as string;
        const getVariant = (state: string): string => {
          if (state === 'Firmado') return 'default';
          if (state === 'Corrupto') return 'destructive';
          return 'secondary';
        };
        const variant = getVariant(estado);
        return <Badge variant={variant as never}>{estado}</Badge>;
      },
    },
  );

  return columns;
};
