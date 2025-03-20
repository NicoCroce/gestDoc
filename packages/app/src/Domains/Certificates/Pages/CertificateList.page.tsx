import { Container, Page, Title } from '@app/Aplication';
import { CertificatesGrid } from '../Components/CertificatesGrid';

import { v4 as uuidv4 } from 'uuid';
import { useGetCertificates } from '../Hooks';
import { NewLicenseButton } from '../Components';

export const CertificateListPage = () => {
  const { data } = useGetCertificates();

  console.log(data);

  return (
    <Page title="Licencias" headerRight={<NewLicenseButton />}>
      {data &&
        Object.entries(data).map(([year, certificates]) => (
          <Container key={uuidv4()} space="large">
            <Title variant="h4">
              Certificados correspondientes al año {year}
            </Title>
            <Container block className="md:mx-14">
              <CertificatesGrid certificatesList={certificates} />
            </Container>
          </Container>
        ))}
    </Page>
  );
};
