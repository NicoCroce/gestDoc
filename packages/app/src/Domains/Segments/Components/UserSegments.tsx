import { useState, useMemo, useCallback } from 'react';
import { Container, Text, Input, Button } from '@app/Application';
import { Badge } from '@app/Application/Components/ui/badge';
import { Skeleton } from '@app/Application/Components/ui/skeleton';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@app/Application/Components/ui/sheet';
import { Checkbox } from '@app/Application/Components/ui/checkbox';
import { Cross2Icon, MagnifyingGlassIcon } from '@radix-ui/react-icons';
import {
  useGetSegmentTypes,
  useGetUserSegments,
  useAssignSegmentToUser,
  useRemoveSegmentFromUser,
  segmentsTRPC,
} from '../Application/segments.queries';
import { useGetEmployees } from '@app/Domains/Disclaimer/hooks/useDisclaimer';
import { _disclaimerService } from '@app/Domains/Disclaimer/Disclaimer.service';
import { SegmentsFilter } from './SegmentsFilter';
import { cn } from '@app/Application/lib/utils';
import { DataTable } from '@app/Application/Components/Organisms/DataCollection/DataTable';
import { useURLParams } from '@app/Application/Hooks/useURLParams';
import { TPagination, IPaginationPages } from '@app/Application/Helpers';

type UserSegmentsQuery = TPagination & { segmentos?: string };
import type { ColumnDef } from '@tanstack/react-table';

interface Employee {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
}

const StatCard = ({
  label,
  value,
  icon,
  className,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      'flex items-center gap-3 rounded-lg border bg-card p-4 shadow-sm',
      className,
    )}
  >
    <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-2xl font-semibold tracking-tight">{value}</p>
      <p className="text-xs text-muted-foreground truncate">{label}</p>
    </div>
  </div>
);

const EmptyState = ({
  hasSearch,
  searchTerm,
  hasSegmentFilter,
  withoutSegments,
}: {
  hasSearch: boolean;
  searchTerm: string;
  hasSegmentFilter: boolean;
  withoutSegments: boolean;
}) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
      <MagnifyingGlassIcon className="size-6 text-muted-foreground" />
    </div>
    <Text className="text-base font-medium">
      {hasSearch
        ? `Sin resultados para «${searchTerm}»`
        : withoutSegments
          ? 'Todos los empleados tienen segmentos asignados'
          : hasSegmentFilter
            ? 'Ningún empleado en los segmentos seleccionados'
            : 'No hay empleados'}
    </Text>
    <Text.Muted className="mt-1 max-w-sm">
      {hasSearch
        ? 'Probá con otro término de búsqueda'
        : withoutSegments
          ? 'Desmarcá el filtro para ver todos los empleados'
          : hasSegmentFilter
            ? 'Limpiá el filtro de segmentos para ver todos los empleados'
            : 'Todavía no hay empleados dados de alta'}
    </Text.Muted>
  </div>
);

const SegmentBadgesCell = ({ userId }: { userId: number }) => {
  const { data: userSegments, isLoading: segsLoading } = useGetUserSegments({
    userId,
  });

  if (segsLoading) {
    return (
      <div className="flex gap-1">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>
    );
  }

  if (userSegments && userSegments.length > 0) {
    return (
      <div className="flex flex-wrap gap-1">
        {userSegments.slice(0, 3).map((seg) => (
          <Badge key={seg.id} variant="secondary" className="text-xs">
            {seg.nombre}
          </Badge>
        ))}
        {userSegments.length > 3 && (
          <Badge variant="outline" className="text-xs">
            +{userSegments.length - 3}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <span className="text-xs text-muted-foreground italic">Sin segmentos</span>
  );
};

const UserSheetContent = ({
  user,
  open,
  onOpenChange,
}: {
  user: Employee;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { data: userSegments, isLoading: segsLoading } = useGetUserSegments({
    userId: user.id,
  });
  const { data: allSegments } = useGetSegmentTypes();
  const assignMutation = useAssignSegmentToUser();
  const removeMutation = useRemoveSegmentFromUser();
  const segUtils = segmentsTRPC.useUtils();
  const discUtils = _disclaimerService.useUtils();

  const invalidateQueries = useCallback(() => {
    segUtils.segments.getUserSegments.invalidate({ userId: user.id });
    discUtils.disclaimer.getEmployees.invalidate();
  }, [segUtils, discUtils, user.id]);

  const userSegmentIds = useMemo(
    () => new Set(userSegments?.map((s) => s.id) ?? []),
    [userSegments],
  );

  const available = useMemo(
    () =>
      userSegments
        ? (allSegments ?? []).filter((s) => !userSegmentIds.has(s.id))
        : [],
    [allSegments, userSegmentIds, userSegments],
  );

  const handleAssign = useCallback(
    (segmentId: number) => {
      assignMutation.mutate(
        { userId: user.id, segmentId },
        { onSuccess: invalidateQueries },
      );
    },
    [assignMutation, user.id, invalidateQueries],
  );

  const handleRemove = useCallback(
    (segmentId: number) => {
      removeMutation.mutate(
        { userId: user.id, segmentId },
        { onSuccess: invalidateQueries },
      );
    },
    [removeMutation, user.id, invalidateQueries],
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader className="pb-4 border-b">
          <SheetTitle className="text-xl">
            {user.nombre} {user.apellido}
          </SheetTitle>
          <SheetDescription>{user.email}</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <Text className="text-sm font-medium text-foreground">
                Segmentos asignados
              </Text>
              {userSegments && (
                <Badge variant="outline" className="text-xs">
                  {userSegments.length}
                </Badge>
              )}
            </div>

            {segsLoading ? (
              <div className="flex gap-2 flex-wrap">
                <Skeleton className="h-7 w-20 rounded-full" />
                <Skeleton className="h-7 w-16 rounded-full" />
                <Skeleton className="h-7 w-24 rounded-full" />
              </div>
            ) : userSegments && userSegments.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {userSegments.map((seg) => (
                  <Badge
                    key={seg.id}
                    variant="secondary"
                    className="gap-1.5 pr-1.5 text-sm"
                  >
                    {seg.nombre}
                    <button
                      type="button"
                      onClick={() => handleRemove(seg.id)}
                      disabled={removeMutation.isPending}
                      className="ml-1 rounded-full p-0.5 hover:bg-destructive/20 hover:text-destructive transition-colors"
                      aria-label={`Quitar ${seg.nombre}`}
                    >
                      <Cross2Icon className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            ) : (
              <Text.Muted className="text-sm">
                Sin segmentos asignados
              </Text.Muted>
            )}
          </div>

          <div className="border-t pt-6">
            <Text className="text-sm font-medium text-foreground mb-3">
              Agregar segmento
            </Text>

            {segsLoading ? (
              <div className="flex gap-2 flex-wrap">
                <Skeleton className="h-9 w-24 rounded-md" />
                <Skeleton className="h-9 w-20 rounded-md" />
              </div>
            ) : available.length === 0 ? (
              <div className="rounded-lg border border-dashed p-4 text-center">
                <Text.Muted className="text-sm">
                  El usuario ya tiene todos los segmentos disponibles
                </Text.Muted>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {available.map((seg) => (
                  <Button
                    key={seg.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleAssign(seg.id)}
                    disabled={assignMutation.isPending}
                    className="gap-1"
                  >
                    + {seg.nombre}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export const UserSegments = () => {
  const [search, setSearch] = useState('');
  const [withoutSegments, setWithoutSegments] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Employee | null>(null);

  const { searchParams } = useURLParams<UserSegmentsQuery>();
  const page = searchParams?.page ?? '1';
  const limit = searchParams?.limit ?? '10';

  const segmentFilter = useMemo(() => {
    const raw = searchParams?.segmentos;
    if (!raw) return [];
    return raw
      .split(',')
      .map(Number)
      .filter((n) => !isNaN(n));
  }, [searchParams?.segmentos]);

  const { data: paginated, isLoading } = useGetEmployees()(
    {
      search,
      page,
      limit,
      withoutSegments,
      segmentIds: segmentFilter.length > 0 ? segmentFilter : undefined,
    },
    { refetchOnMount: 'always' },
  );

  const { data: allSegmentTypes } = useGetSegmentTypes();

  const employees: Employee[] = paginated?.data ?? [];

  const paginationMeta: IPaginationPages = useMemo(
    () =>
      paginated?.meta ?? {
        totalPages: 1,
        totalItems: 0,
        currentPage: 1,
        hasMore: false,
      },
    [paginated],
  );

  const totalSegmentTypes = allSegmentTypes?.length ?? 0;

  const columns: ColumnDef<Employee>[] = useMemo(
    () => [
      {
        id: 'empleado',
        header: 'Empleado',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
              {row.original.nombre.charAt(0).toUpperCase()}
              {row.original.apellido.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium text-sm">
                {row.original.nombre} {row.original.apellido}
              </p>
              <p className="truncate text-xs text-muted-foreground md:hidden">
                {row.original.email}
              </p>
            </div>
          </div>
        ),
      },
      {
        id: 'email',
        header: 'Email',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.email}
          </span>
        ),
      },
      {
        id: 'segmentos',
        header: 'Segmentos',
        cell: ({ row }) => <SegmentBadgesCell userId={row.original.id} />,
      },
      {
        id: 'accion',
        header: () => <span className="sr-only">Acción</span>,
        cell: ({ row }) => (
          <div className="text-right">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedUser(row.original)}
              className="text-xs"
            >
              Asignar
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <Container space="medium">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard
          label="Total empleados"
          value={paginationMeta.totalItems}
          icon={<MagnifyingGlassIcon className="size-5" />}
        />
        <StatCard
          label="Tipos de segmento"
          value={totalSegmentTypes}
          icon={
            <svg
              className="size-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 6h.008v.008H6V6Z"
              />
            </svg>
          }
        />
        <StatCard
          label="Segmentos seleccionados"
          value={segmentFilter.length || 'Todos'}
          icon={
            <svg
              className="size-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
              />
            </svg>
          }
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            value={search}
            placeholder="Buscar por nombre, apellido o email..."
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            aria-label="Buscar empleado"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Limpiar búsqueda"
            >
              <Cross2Icon className="size-4" />
            </button>
          )}
        </div>
        <label
          className={cn(
            'flex items-center gap-2 rounded-md border px-3 py-2 cursor-pointer text-sm transition-colors',
            withoutSegments && 'border-primary bg-primary/5',
          )}
        >
          <Checkbox
            checked={withoutSegments}
            onCheckedChange={(checked) => setWithoutSegments(Boolean(checked))}
          />
          Sin segmento asignado
        </label>
        <div className="w-full sm:w-64">
          <SegmentsFilter />
        </div>
      </div>

      {isLoading ? (
        <DataTable.Skeleton />
      ) : employees.length > 0 ? (
        <DataTable
          columns={columns}
          data={employees}
          pagination={paginationMeta}
        />
      ) : (
        <EmptyState
          hasSearch={search.length > 0}
          searchTerm={search}
          hasSegmentFilter={segmentFilter.length > 0}
          withoutSegments={withoutSegments}
        />
      )}

      {selectedUser && (
        <UserSheetContent
          user={selectedUser}
          open
          onOpenChange={(open) => {
            if (!open) setSelectedUser(null);
          }}
        />
      )}
    </Container>
  );
};
