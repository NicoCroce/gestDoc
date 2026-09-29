import { useState, useMemo, useCallback } from 'react';
import { useURLParams } from '@app/Application/Hooks/useURLParams';
import { TPagination } from '@app/Application/Helpers';
import { employeeColumns } from '../Components/EmpleadosColumns';
import {
  useGetEmployees,
  useSendReminders,
} from '@app/Domains/Admin/Hooks/useEmployeeActions';
import { useHasDisclaimerText } from './useHasDisclaimerText';

export const useEmpleadosPage = () => {
  const [search, setSearch] = useState('');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const { searchParams } = useURLParams<TPagination>();
  const page = searchParams?.page ?? '1';
  const limit = searchParams?.limit ?? '10';

  const {
    data: paginated,
    isLoading,
    isError,
    error,
  } = useGetEmployees()({ search, page, limit }, { refetchOnMount: 'always' });

  const { hasDisclaimerText, isLoading: isLoadingHasDisclaimerText } =
    useHasDisclaimerText();

  const sendReminders = useSendReminders();

  const employees = useMemo(() => paginated?.data ?? [], [paginated]);

  const paginationMeta = useMemo(
    () =>
      paginated?.meta ?? {
        totalPages: 1,
        totalItems: 0,
        currentPage: 1,
        hasMore: false,
      },
    [paginated],
  );

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
  }, []);

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

  const handleActivateSelection = useCallback(() => {
    setSelectionMode(true);
    const pendingIds = hasDisclaimerText
      ? new Set(
          employees
            .filter((e) => e.estado_firma === 'Pendiente')
            .map((e) => e.id),
        )
      : new Set<number>();
    setSelectedIds(pendingIds);
  }, [employees, hasDisclaimerText]);

  const handleCancelSelection = useCallback(() => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  }, []);

  const handleConfirmReminders = useCallback(() => {
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
  }, [selectedIds, sendReminders]);

  const columns = useMemo(
    () =>
      employeeColumns({
        selectionMode,
        selectedIds,
        onToggleSelection: handleToggleSelection,
        onToggleAll: handleToggleAll,
        hasDisclaimerText,
      }),
    [
      selectionMode,
      selectedIds,
      handleToggleSelection,
      handleToggleAll,
      hasDisclaimerText,
    ],
  );

  return {
    search,
    handleSearch,
    selectionMode,
    selectedIds,
    handleActivateSelection,
    handleCancelSelection,
    handleConfirmReminders,
    handleToggleSelection,
    sendReminders,
    employees,
    paginationMeta,
    columns,
    hasDisclaimerText,
    isLoading: isLoading || isLoadingHasDisclaimerText,
    isError,
    error,
  };
};
