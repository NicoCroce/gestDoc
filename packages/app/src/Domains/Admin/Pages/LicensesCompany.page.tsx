import { useState } from 'react';
import { Container, Page } from '@app/Application';

import { useGetCertificatesByCompany } from '../Hooks';
import {
  LicensesListWrapper,
  MonthlyLicensesChart,
  StatisticsCertificates,
} from '../Components';
import { SegmentsFilter } from '@app/Domains/Segments/Components/SegmentsFilter';
import { useGetUsersBySegments } from '@app/Domains/Segments/Application/segments.queries';

export const LicensesCompanyPage = () => {
  const service = useGetCertificatesByCompany();
  const [segmentIds, setSegmentIds] = useState<number[]>([]);

  const { data: filteredUserIds } = useGetUsersBySegments(
    { segmentIds },
    { enabled: segmentIds.length > 0 },
  );

  return (
    <Page title="Todos los certificados de la empresa">
      <Container>
        <StatisticsCertificates />
        <MonthlyLicensesChart />
        <Container row align="center" space="small">
          <div className="w-full max-w-[320px]">
            <SegmentsFilter value={segmentIds} onChange={setSegmentIds} />
          </div>
        </Container>
        <Container row>
          <div className="min-w-[300px] w-full">
            <LicensesListWrapper
              service={service}
              filteredUserIds={
                filteredUserIds ? new Set(filteredUserIds) : undefined
              }
            />
          </div>
        </Container>
      </Container>
    </Page>
  );
};
