import { USERS_CHANGE_PASSWORD } from '@app/Domains/Users/Users.routes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRightFromBracket,
  faChartLine,
  faFile,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { NavLink, NavLinkRenderProps } from 'react-router-dom';
import { Container } from '../Container';
import { NavBarHeader } from './NavBarHeader';
import { useDevice } from '@app/Aplication/Hooks';
import { DOCUMENTS_DASHBOARD, DOCUMENTS_ROUTE } from '@app/Domains/Documents';
import { useHasPermission } from '@app/Aplication/Hooks/useHasPermission';
import { DASHBOARD_ACCESS } from '@app/Aplication/Helpers';

export const styleLink =
  'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary';

export const NavBar = ({ className = '' }: { className?: string }) => {
  const { isMobile } = useDevice();
  const { hasPermission } = useHasPermission();

  const isActiveLink = ({ isActive }: NavLinkRenderProps): string => {
    return isActive ? styleLink + ' bg-muted' : styleLink;
  };

  return (
    <aside className={`navbar pt-6 md:pt-14 ${className}`}>
      <NavBarHeader />
      <nav className="flex flex-col h-full justify-between mt-4">
        <Container className="flex flex-col gap-2 md:p-4">
          {hasPermission(DASHBOARD_ACCESS) && (
            <NavLink to={DOCUMENTS_DASHBOARD} className={isActiveLink}>
              <FontAwesomeIcon icon={faChartLine} />
              Administrar
            </NavLink>
          )}
          <NavLink to={DOCUMENTS_ROUTE} className={isActiveLink}>
            <FontAwesomeIcon icon={faFile} />
            Documentos
          </NavLink>
        </Container>
        <Container className="flex flex-col gap-2 md:p-4">
          {isMobile ? (
            <NavLink to={USERS_CHANGE_PASSWORD} className={styleLink}>
              <FontAwesomeIcon icon={faUser} />
              Mi cuenta
            </NavLink>
          ) : null}
          <NavLink to="/" className={styleLink}>
            <FontAwesomeIcon icon={faArrowRightFromBracket} />
            Salir
          </NavLink>
        </Container>
      </nav>
    </aside>
  );
};
