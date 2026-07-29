import { useState, useMemo } from 'react';
import { Container, Title, Text, Input, Button } from '@app/Application';
import { Badge } from '@app/Application/Components/ui/badge';
import { Skeleton } from '@app/Application/Components/ui/skeleton';
import { ScrollArea } from '@app/Application/Components/ui/scroll-area';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { Cross2Icon, MagnifyingGlassIcon } from '@radix-ui/react-icons';
import {
  useGetSegmentTypes,
  useGetUserSegments,
  useAssignSegmentToUser,
  useRemoveSegmentFromUser,
} from '../Application/segments.queries';
import { useGetEmployees } from '@app/Domains/Disclaimer/hooks/useDisclaimer';

const UserCard = ({
  userId,
  userName,
}: {
  userId: number;
  userName: string;
}) => {
  const { data: userSegments, isLoading: segsLoading } = useGetUserSegments({
    userId,
  });
  const removeMutation = useRemoveSegmentFromUser();

  const [expanded, setExpanded] = useState(false);

  return (
    <Container className="border rounded-lg p-4">
      <Container row align="center" justify="between">
        <div>
          <Text className="font-medium">{userName}</Text>
          {userSegments && userSegments.length > 0 && (
            <Container row space="small" className="mt-1 flex-wrap">
              {userSegments.map((seg) => (
                <Badge key={seg.id} variant="secondary" className="gap-1">
                  {seg.nombre}
                  <button
                    type="button"
                    onClick={() =>
                      removeMutation.mutate({
                        userId,
                        segmentId: seg.id,
                      })
                    }
                    className="ml-1 hover:text-destructive"
                    aria-label={`Quitar ${seg.nombre}`}
                  >
                    <FontAwesomeIcon icon={faXmark} className="size-3" />
                  </button>
                </Badge>
              ))}
            </Container>
          )}
          {segsLoading && (
            <Container row space="small" className="mt-1">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </Container>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Cerrar' : 'Asignar'}
        </Button>
      </Container>

      {expanded && <UserSegmentSelector userId={userId} />}
    </Container>
  );
};

const UserSegmentSelector = ({ userId }: { userId: number }) => {
  const { data: allSegments } = useGetSegmentTypes();
  const { data: userSegments } = useGetUserSegments({ userId });
  const assignMutation = useAssignSegmentToUser();

  const userSegmentIds = useMemo(
    () => new Set(userSegments?.map((s) => s.id) ?? []),
    [userSegments],
  );

  if (!allSegments)
    return (
      <Container className="mt-3">
        <Skeleton className="h-8 w-full" />
      </Container>
    );

  const available = allSegments.filter((s) => !userSegmentIds.has(s.id));

  if (available.length === 0) {
    return (
      <Container className="mt-3 pl-2">
        <Text.Muted>Ya tiene todos los segmentos asignados</Text.Muted>
      </Container>
    );
  }

  return (
    <Container space="small" className="mt-3 pl-2 border-l-2">
      <Text className="text-xs text-muted-foreground">Agregar segmento:</Text>
      <Container className="flex flex-wrap gap-2">
        {available.map((seg) => (
          <Button
            key={seg.id}
            variant="outline"
            size="sm"
            onClick={() => assignMutation.mutate({ userId, segmentId: seg.id })}
            disabled={assignMutation.isPending}
            className="gap-1"
          >
            + {seg.nombre}
          </Button>
        ))}
      </Container>
    </Container>
  );
};

export const UserSegments = () => {
  const [search, setSearch] = useState('');
  const { data: paginated, isLoading } = useGetEmployees()(
    { search, page: '1', limit: '50' },
    { refetchOnMount: 'always' },
  );

  const employees = paginated?.data ?? [];

  return (
    <Container space="medium">
      <Title variant="h3">Segmentos por usuario</Title>

      <Container className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
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
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            aria-label="Limpiar búsqueda"
          >
            <Cross2Icon className="size-4" />
          </button>
        )}
      </Container>

      {isLoading ? (
        <Container space="small">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </Container>
      ) : employees.length > 0 ? (
        <ScrollArea className="h-[60vh]">
          <Container space="small">
            {employees.map((emp) => (
              <UserCard
                key={emp.id}
                userId={emp.id}
                userName={`${emp.nombre} ${emp.apellido}`}
              />
            ))}
          </Container>
        </ScrollArea>
      ) : (
        <Container align="center" justify="center" className="py-10">
          <Text.Muted>
            {search
              ? `No se encontraron empleados para «${search}»`
              : 'No hay empleados'}
          </Text.Muted>
        </Container>
      )}
    </Container>
  );
};
