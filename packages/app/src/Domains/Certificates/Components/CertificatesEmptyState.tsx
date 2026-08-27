import { AlertMessage } from '@app/Application';

interface CertificatesEmptyStateProps {
  onFilterClick: () => void;
}

export const CertificatesEmptyState = ({
  onFilterClick,
}: CertificatesEmptyStateProps) => (
  <div className="flex flex-1 items-center justify-center min-h-[60vh]">
    <AlertMessage
      variant="search"
      title="No se encontraron coincidencias"
      action={{
        label: 'Actualizar filtros',
        onClick: onFilterClick,
        variant: 'link',
      }}
    />
  </div>
);
