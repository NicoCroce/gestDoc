import { Container, Page } from '@app/Application';

import { useGetCertificatesByCompany } from '../Hooks';
import {
  LicensesListWrapper,
  MonthlyLicensesChart,
  StatisticsCertificates,
} from '../Components';

export const LicensesCompanyPage = () => {
  const service = useGetCertificatesByCompany();

  return (
    <Page title="Todos los certificados de la empresa">
      <Container>
        <StatisticsCertificates />
        <MonthlyLicensesChart />
        <Container row>
          <div className="min-w-[300px] w-full">
            <LicensesListWrapper service={service} />
          </div>
        </Container>
      </Container>
    </Page>
  );
};
