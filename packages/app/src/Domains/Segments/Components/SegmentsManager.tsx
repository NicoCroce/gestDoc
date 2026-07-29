import { useState } from 'react';
import { Container, Title, Text, Button } from '@app/Application';
import { Input } from '@app/Application/Components/ui/input';
import { Label } from '@app/Application/Components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@app/Application/Components/ui/dialog';
import { AlertDialogCancelConfirm } from '@app/Application';
import { AlertDialogTrigger } from '@radix-ui/react-alert-dialog';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit,
  faPlus,
  faSpinner,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import {
  useGetSegmentTypes,
  useCreateSegmentType,
  useUpdateSegmentType,
  useDeleteSegmentType,
} from '../Application/segments.queries';
import type { TSegmentType } from '../Domain/segments.types';

const SegmentRow = ({
  segment,
  onEdit,
  onDelete,
}: {
  segment: TSegmentType;
  onEdit: (seg: TSegmentType) => void;
  onDelete: (id: number) => void;
}) => (
  <Container
    row
    align="center"
    justify="between"
    className="py-3 px-4 border-b last:border-b-0 hover:bg-muted/50 rounded-sm"
  >
    <Text>{segment.nombre}</Text>
    <Container row space="small">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onEdit(segment)}
        className="text-muted-foreground hover:text-primary"
      >
        <FontAwesomeIcon icon={faEdit} className="size-4" />
      </Button>
      <AlertDialogCancelConfirm onConfirm={() => onDelete(segment.id)}>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
          >
            <FontAwesomeIcon icon={faTrash} className="size-4" />
          </Button>
        </AlertDialogTrigger>
      </AlertDialogCancelConfirm>
    </Container>
  </Container>
);

export const SegmentsManager = () => {
  const { data: segments, isLoading } = useGetSegmentTypes();
  const createMutation = useCreateSegmentType();
  const updateMutation = useUpdateSegmentType();
  const deleteMutation = useDeleteSegmentType();

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<TSegmentType | null>(null);
  const [newName, setNewName] = useState('');
  const [editName, setEditName] = useState('');

  const handleCreate = () => {
    if (!newName.trim()) return;
    createMutation.mutate(
      { nombre: newName.trim() },
      {
        onSuccess: () => {
          setNewName('');
          setCreateOpen(false);
        },
      },
    );
  };

  const handleEdit = () => {
    if (!editTarget || !editName.trim()) return;
    updateMutation.mutate(
      { id: editTarget.id, nombre: editName.trim() },
      {
        onSuccess: () => {
          setEditTarget(null);
          setEditName('');
        },
      },
    );
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate({ id });
  };

  if (isLoading) {
    return (
      <Container align="center" justify="center" className="py-10">
        <FontAwesomeIcon
          icon={faSpinner}
          spin
          className="size-6 text-muted-foreground"
        />
      </Container>
    );
  }

  return (
    <Container space="medium">
      <Container row align="center" justify="between">
        <Title variant="h3">Segmentos</Title>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <FontAwesomeIcon icon={faPlus} className="mr-2 size-4" />
              Nuevo segmento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear segmento</DialogTitle>
            </DialogHeader>
            <Container space="small">
              <Label htmlFor="create-name">Nombre</Label>
              <Input
                id="create-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ej: Contabilidad"
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                autoFocus
              />
            </Container>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button
                onClick={handleCreate}
                disabled={!newName.trim() || createMutation.isPending}
                isLoading={createMutation.isPending}
              >
                Crear
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Container>

      <Container className="border rounded-lg">
        {segments && segments.length > 0 ? (
          segments.map((seg) => (
            <SegmentRow
              key={seg.id}
              segment={seg}
              onEdit={(s) => {
                setEditTarget(s);
                setEditName(s.nombre);
              }}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <Container align="center" justify="center" className="py-8">
            <Text.Muted>No hay segmentos creados</Text.Muted>
          </Container>
        )}
      </Container>

      <Dialog
        open={editTarget !== null}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar segmento</DialogTitle>
          </DialogHeader>
          <Container space="small">
            <Label htmlFor="edit-name">Nombre</Label>
            <Input
              id="edit-name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
              autoFocus
            />
          </Container>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button
              onClick={handleEdit}
              disabled={!editName.trim() || updateMutation.isPending}
              isLoading={updateMutation.isPending}
            >
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Container>
  );
};
