import { Button, Page, Text } from '@app/Aplication';
import { CertificatesGrid } from '../Components/CertificatesGrid';
import { faAdd } from '@fortawesome/free-solid-svg-icons';

export const CertificateListPage = () => {
  return (
    <Page
      title="Certificados"
      headerRight={
        <Button showIcon icon={faAdd}>
          Cargar certificado
        </Button>
      }
    >
      <Text.Lead>Certificados correspondientes al año 2025</Text.Lead>
      <CertificatesGrid />
      <Text.Lead>Certificados correspondientes al año 2024</Text.Lead>
      <CertificatesGrid />
    </Page>
  );
};
