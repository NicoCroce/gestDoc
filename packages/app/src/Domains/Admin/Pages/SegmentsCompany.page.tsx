import { Page, Container } from '@app/Application';
import { SegmentsManager } from '@app/Domains/Segments/Components/SegmentsManager';

export const SegmentsCompanyPage = () => (
  <Page title="Segmentos">
    <Container>
      <SegmentsManager />
    </Container>
  </Page>
);
