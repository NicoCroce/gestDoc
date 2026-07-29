import { Page, Container } from '@app/Application';
import { UserSegments } from '@app/Domains/Segments/Components/UserSegments';

export const UserSegmentsPage = () => (
  <Page title="Segmentos por usuario">
    <Container>
      <UserSegments />
    </Container>
  </Page>
);
