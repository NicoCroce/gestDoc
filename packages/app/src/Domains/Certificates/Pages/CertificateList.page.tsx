import { Button, Container, Page, Text } from '@app/Aplication';
import { CertificatesGrid } from '../Components/CertificatesGrid';
import { faAdd } from '@fortawesome/free-solid-svg-icons';
import { useGetCertificates } from '../Hooks/useGetCertificates';
import { v4 as uuidv4 } from 'uuid';

export const CertificateListPage = () => {
  const { data } = useGetCertificates();

  return (
    <Page
      title="Certificados"
      headerRight={
        <Button showIcon icon={faAdd}>
          Cargar certificado
        </Button>
      }
    >
      {data &&
        Object.entries(data).map(([year, certificates]) => (
          <Container key={uuidv4()} space="large">
            <Text.Lead>Certificados correspondientes al año {year}</Text.Lead>
            <CertificatesGrid certificatesList={certificates} />
          </Container>
        ))}
    </Page>
  );
};
