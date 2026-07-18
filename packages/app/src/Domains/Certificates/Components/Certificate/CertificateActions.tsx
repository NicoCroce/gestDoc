import { Container } from '@app/Application/Components';
import { Button } from '@app/Application/Components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@app/Application/Components/ui/select';
import { AlertDialogCancelConfirm } from '@app/Application/Components/Molecules/AlertDialog';
import { useDeleteCertificate } from '../../Hooks/useDeleteCertificate';
import { useUpdateCertificateStatus } from '../../Hooks/useUpdateCertificateStatus';
import { ICertificate } from '../../Certificate.entity';
import { CertificateStatus } from '@server/domains/Certificates/Domain/Certificate.types';

interface CertificateActionsProps {
  certificate: ICertificate;
  variant: 'owner' | 'admin';
}

const STATUS_OPTIONS: { value: CertificateStatus; label: string }[] = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en validación', label: 'En validación' },
  { value: 'aprobado', label: 'Aprobado' },
  { value: 'rechazado', label: 'Rechazado' },
];

export const CertificateActions = ({
  certificate,
  variant,
}: CertificateActionsProps) => {
  const { mutateDelete, isPending: isDeleting } = useDeleteCertificate();
  const { mutateUpdate, isPending: isUpdating } = useUpdateCertificateStatus();

  const handleDelete = async () => {
    await mutateDelete(certificate.id);
  };

  const handleStatusChange = async (status: CertificateStatus) => {
    await mutateUpdate(certificate.id, status);
  };

  if (variant === 'owner') {
    if (certificate.status !== 'pendiente') return null;

    return (
      <AlertDialogCancelConfirm
        onConfirm={handleDelete}
        message="¿Estás seguro de que deseas eliminar esta licencia?"
      >
        <Button
          variant="outline"
          size="sm"
          disabled={isDeleting}
          className="w-full"
        >
          {isDeleting ? 'Eliminando...' : 'Eliminar'}
        </Button>
      </AlertDialogCancelConfirm>
    );
  }

  // Admin variant
  return (
    <Container row className="gap-2">
      <Select value={certificate.status} onValueChange={handleStatusChange}>
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
        <Button variant="outline" size="sm" disabled={isDeleting}>
          {isDeleting ? 'Eliminando...' : 'Eliminar'}
        </Button>
      </AlertDialogCancelConfirm>
    </Container>
  );
};
