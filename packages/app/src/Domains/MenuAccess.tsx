import { Container } from '@app/Aplication';
import { MenuUsers } from './Users';
import { MenuAuth } from './Auth';
import { MenuDashboard, MenuDocuments } from './Documents/MenuDocuments';
import { MenuCertificates } from './Certificates/MenuCertificates';

export const styleLink =
  'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary';

export const MenuAccess = () => (
  <>
    <Container id="sections" space="small">
      <MenuDashboard />
      <MenuUsers />
      <MenuDocuments />
      <MenuCertificates />
    </Container>
    <Container id="footer" space="small">
      <MenuAuth />
    </Container>
  </>
);
