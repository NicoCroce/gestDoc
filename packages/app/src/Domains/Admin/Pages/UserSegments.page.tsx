import { Page } from '@app/Application';
import { UserSegments } from '@app/Domains/Segments/Components/UserSegments';

export const UserSegmentsPage = () => (
  <Page title="Segmentos por usuario">
    <UserSegments />
  </Page>
);
