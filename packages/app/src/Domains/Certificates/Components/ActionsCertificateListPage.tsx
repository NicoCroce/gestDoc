import { Container, FilterButton, FilterButtonProps } from '@app/Application';
import { NewLicenseButton } from './NewLicenseButton';

type ActionsCertificateListPageProps = FilterButtonProps;

export const ActionsCertificateListPage = ({
  onClick,
}: ActionsCertificateListPageProps) => (
  <Container row>
    <NewLicenseButton />
    <FilterButton onClick={onClick} />
  </Container>
);
