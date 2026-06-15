import { Container } from '@app/Application';
import { MenuAuth } from './Auth';
import { MenuDocuments } from './Documents/MenuDocuments';
import { MenuCertificates } from './Certificates/MenuCertificates';
import { MenuDashboard } from './Admin';
import { MenuEmpresasUsuarios } from './EmpresasUsuarios';

export const styleLink =
  'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary';

export const MenuAccess = () => (
  <>
    <Container id="sections" space="small">
      <MenuDashboard />
      <MenuDocuments />
      <MenuCertificates />
    </Container>
    <Container id="footer" space="small">
      <MenuEmpresasUsuarios />
      <MenuAuth />
    </Container>
  </>
);
