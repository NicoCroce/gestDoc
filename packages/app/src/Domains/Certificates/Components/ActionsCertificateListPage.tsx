import { Container, FilterButton, FilterButtonProps } from '@app/Aplication';
import { NewLicenseButton } from './NewLicenseButton';

interface ActionsCertificateListPageProps extends FilterButtonProps {}

export const ActionsCertificateListPage = ({
  onClick,
}: ActionsCertificateListPageProps) => (
  <Container row>
    <NewLicenseButton />
    <FilterButton onClick={onClick} />
  </Container>
);
