import { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Container, Text } from '@app/Application';
import { Skeleton } from '@app/Application/Components/ui/skeleton';
import { Input } from '@app/Application/Components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@app/Application/Components/ui/alert-dialog';
import {
  useGetSegmentTypes,
  useUpdateSegmentType,
  useDeleteSegmentType,
} from '../Application/segments.queries';
import type { TSegmentType } from '../Domain/segments.types';
import { CreateSegmentDialog } from './CreateSegmentDialog';

const LoadingSkeleton = () => (
  <div className="space-y-2">
    {Array.from({ length: 4 }).map((_, i) => (
      <Skeleton key={i} className="h-16 w-full rounded-xl" />
    ))}
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-20 px-6 text-center">
    <div className="mb-5 flex size-14 items-center justify-center rounded-full bg-muted">
      <svg
        className="size-6 text-muted-foreground"
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
    </div>
    <Text className="text-base font-medium">Todavía no hay segmentos</Text>
    <Text.Muted className="mt-1 mb-5 max-w-xs">
      Los segmentos agrupan usuarios para organizar el acceso a documentos. Creá
      el primero para empezar.
    </Text.Muted>
    <CreateSegmentDialog />
  </div>
);

const InlineEditableName = ({ segment }: { segment: TSegmentType }) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(segment.nombre);
  const inputRef = useRef<HTMLInputElement>(null);
  const updateMutation = useUpdateSegmentType();

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const save = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || trimmed === segment.nombre) {
      setValue(segment.nombre);
      setEditing(false);
      return;
    }
    updateMutation.mutate(
      { id: segment.id, nombre: trimmed },
      {
        onSuccess: () => {
          toast.success('Segmento renombrado');
          setEditing(false);
        },
        onError: (err) => {
          toast.error(err.message ?? 'Error al renombrar');
          setValue(segment.nombre);
          setEditing(false);
        },
      },
    );
  }, [value, segment, updateMutation]);

  const cancel = useCallback(() => {
    setValue(segment.nombre);
    setEditing(false);
  }, [segment.nombre]);

  if (editing) {
    return (
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === 'Enter') save();
          if (e.key === 'Escape') cancel();
        }}
        className="h-8 text-sm font-medium px-2 py-1"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setValue(segment.nombre);
        setEditing(true);
      }}
      className="group flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer rounded-md -ml-2 px-2 py-1 hover:bg-accent transition-colors"
    >
      <span>{segment.nombre}</span>
      <svg
        className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
        />
      </svg>
    </button>
  );
};

export const SegmentsManager = () => {
  const { data: segments, isLoading } = useGetSegmentTypes();
  const deleteMutation = useDeleteSegmentType();
  const [deleteTarget, setDeleteTarget] = useState<TSegmentType | null>(null);

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(
      { id: deleteTarget.id },
      {
        onSuccess: () => {
          toast.success('Segmento eliminado');
          setDeleteTarget(null);
        },
        onError: (err) => {
          toast.error(err.message ?? 'Error al eliminar');
        },
      },
    );
  };

  if (isLoading) return <LoadingSkeleton />;

  return (
    <Container space="medium">
      {segments && segments.length > 0 ? (
        <div className="space-y-2">
          {segments.map((seg) => (
            <div
              key={seg.id}
              className="group flex items-center justify-between rounded-xl border bg-card px-5 py-4 shadow-sm transition-all hover:shadow-md hover:border-primary/20"
            >
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <span className="flex size-2 shrink-0 rounded-full bg-primary/40" />
                <div className="min-w-0 flex-1">
                  <InlineEditableName segment={seg} />
                </div>
              </div>

              <AlertDialog
                open={deleteTarget?.id === seg.id}
                onOpenChange={(open) => {
                  if (!open) setDeleteTarget(null);
                }}
              >
                <AlertDialogTrigger asChild>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(seg)}
                    className="flex size-8 items-center justify-center rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
                    aria-label={`Eliminar ${seg.nombre}`}
                  >
                    <svg
                      className="size-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                      />
                    </svg>
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      ¿Eliminar «{seg.nombre}»?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Se van a eliminar las asignaciones de este segmento a
                      todos los usuarios. Esta acción no se puede deshacer.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteConfirm}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </Container>
  );
};
