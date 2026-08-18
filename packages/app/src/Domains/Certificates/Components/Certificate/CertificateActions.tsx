import { useState } from 'react';
import { Button, Container } from '@app/Application/Components';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@app/Application/Components/ui/select';
import { AlertDialogCancelConfirm } from '@app/Application/Components/Molecules/AlertDialog';
import { AlertDialogTrigger } from '@radix-ui/react-alert-dialog';
import { useDeleteCertificate } from '../../Hooks/useDeleteCertificate';
import { useUpdateCertificateStatus } from '../../Hooks/useUpdateCertificateStatus';
import { TCertificate } from '../../Certificate.entity';
import { CertificateStatus } from '@server/domains/Certificates/Domain/Certificate.types';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { RejectionReasonModal } from '../RejectionReasonModal';

type MutableStatus = Exclude<CertificateStatus, 'eliminado'>;

interface CertificateActionsProps {
  certificate: TCertificate;
  variant: 'owner' | 'admin';
}

const STATUS_OPTIONS: { value: MutableStatus; label: string }[] = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'validando', label: 'Validando' },
  { value: 'aprobado', label: 'Aprobado' },
  { value: 'rechazado', label: 'Rechazado' },
];

export const CertificateActions = ({
  certificate,
  variant,
}: CertificateActionsProps) => {
  const { mutateDelete, isPending: isDeleting } = useDeleteCertificate();
  const { mutateUpdate, isPending: isUpdating } = useUpdateCertificateStatus();

  const [modalOpen, setModalOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<MutableStatus | null>(
    null,
  );

  const handleDelete = async () => {
    await mutateDelete(certificate.id);
  };

  const handleStatusChange = async (status: string) => {
    const mutableStatus = status as MutableStatus;
    if (mutableStatus === 'rechazado') {
      setPendingStatus('rechazado');
      setModalOpen(true);
      return;
    }
    await mutateUpdate(certificate.id, mutableStatus);
  };

  const handleModalConfirm = async (reason: string) => {
    if (!pendingStatus) return;
    await mutateUpdate(certificate.id, pendingStatus, reason);
    setModalOpen(false);
    setPendingStatus(null);
  };

  const handleModalCancel = () => {
    setModalOpen(false);
    setPendingStatus(null);
  };

  // Los certificados eliminados no pueden tener acciones
  if (certificate.status === 'eliminado') return null;

  if (variant === 'owner') {
    if (certificate.status !== 'pendiente') return null;

    return (
      <AlertDialogCancelConfirm
        onConfirm={handleDelete}
        message="¿Estás seguro de que deseas eliminar esta licencia?"
      >
        <AlertDialogTrigger asChild>
          <Container row justify="end">
            <Button
              variant="outline"
              size="sm"
              disabled={isDeleting}
              icon={faTrash}
              showIcon
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </Container>
        </AlertDialogTrigger>
      </AlertDialogCancelConfirm>
    );
  }

  // Admin variant
  return (
    <>
      <Container row className="gap-2">
        <Select
          value={
            modalOpen
              ? (pendingStatus ?? certificate.status)
              : certificate.status
          }
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="flex-1" disabled={isUpdating}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <AlertDialogCancelConfirm
          onConfirm={handleDelete}
          message="¿Estás seguro de que deseas eliminar esta licencia?"
        >
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" disabled={isDeleting}>
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </AlertDialogTrigger>
        </AlertDialogCancelConfirm>
      </Container>

      <RejectionReasonModal
        open={modalOpen}
        onConfirm={handleModalConfirm}
        onCancel={handleModalCancel}
        isPending={isUpdating}
      />
    </>
  );
};
