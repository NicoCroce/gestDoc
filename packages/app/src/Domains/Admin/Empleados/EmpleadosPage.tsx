import { useState, useMemo, useCallback } from 'react';
import { Container, Page, Input } from '@app/Application';
import { DataTable } from '@app/Application/Components/Organisms/DataCollection/DataTable';
import { Button } from '@app/Application/Components';
import { employeeColumns } from './columns';
import {
  useGetEmployees,
  useSendReminders,
} from '@app/Domains/Disclaimer/hooks/useDisclaimer';

export const EmpleadosPage = () => {
  const [search, setSearch] = useState('');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const { data, isLoading } = useGetEmployees()({ search });

  const sendReminders = useSendReminders();

  const employees = useMemo(() => data ?? [], [data]);

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  const handleToggleSelection = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleToggleAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (prev.size === employees.length) {
        return new Set();
      }
      return new Set(employees.map((e) => e.id));
    });
  }, [employees]);

  const handleActivateSelection = () => {
    setSelectionMode(true);
    const pendingIds = new Set(
      employees.filter((e) => e.estado_firma === 'Pendiente').map((e) => e.id),
    );
    setSelectedIds(pendingIds);
  };

  const handleConfirmReminders = () => {
    if (selectedIds.size === 0) return;
    sendReminders.mutate(
      { employeeIds: Array.from(selectedIds) },
      {
        onSuccess: () => {
          setSelectionMode(false);
          setSelectedIds(new Set());
        },
      },
    );
  };

  const columns = useMemo(
    () =>
      employeeColumns({
        selectionMode,
        selectedIds,
        onToggleSelection: handleToggleSelection,
        onToggleAll: handleToggleAll,
      }),
    [selectionMode, selectedIds, handleToggleSelection, handleToggleAll],
  );

  return (
    <Page title="Empleados">
      <Container space="small" row>
        <h1 className="text-2xl font-bold">Empleados</h1>
      </Container>
      <Container space="small" row className="gap-2">
        <Input
          placeholder="Buscar por nombre, apellido o email..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
        />
        {!selectionMode ? (
          <Button variant="outline" onClick={handleActivateSelection}>
            Enviar recordatorios
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={handleConfirmReminders}
            disabled={sendReminders.isPending || selectedIds.size === 0}
            isLoading={sendReminders.isPending}
          >
            Confirmar
          </Button>
        )}
      </Container>
      <DataTable
        columns={columns}
        data={employees}
        pagination={{
          totalPages: 1,
          totalItems: employees.length,
          currentPage: 1,
          hasMore: false,
        }}
      />
      {isLoading && (
        <p className="text-center text-muted-foreground">Cargando...</p>
      )}
    </Page>
  );
};
