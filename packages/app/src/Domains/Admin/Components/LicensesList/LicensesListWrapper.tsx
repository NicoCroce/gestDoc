import { Container, Title } from '@app/Application';
import { Card } from '@app/Application/Components/ui/card';
import { LicensesListSearch } from './LicensesListSearch';
import { TuseGetCertificatesByCompany } from '@app/Domains/Admin/Hooks';

interface DocumentsListWrapperProps {
  service: TuseGetCertificatesByCompany;
}

export const LicensesListWrapper = ({ service }: DocumentsListWrapperProps) => (
  <Card className="p-4">
    <Container>
      <Title variant="h2" className="py-6 mb-6">
        Listado de Empleados
      </Title>
      <LicensesListSearch service={service} />
    </Container>
  </Card>
);
