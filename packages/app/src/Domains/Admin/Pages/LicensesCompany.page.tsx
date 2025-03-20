import { Container, Page } from '@app/Aplication';
import { Statistics } from '../../Documents/Components';

import { useGetCertificatesByCompany } from '../Hooks';
import { LicensesListWrapper } from '../Components';

export const LicensesCompanyPage = () => {
  //const { isMobile } = useDevice();
  const service = useGetCertificatesByCompany();

  return (
    <Page title="Todos los documentos de la empresa">
      <Container>
        <Statistics />
        <Container row>
          <div className="min-w-[300px] w-full">
            <LicensesListWrapper service={service} />
          </div>
        </Container>
      </Container>
    </Page>
  );
};
