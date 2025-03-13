import { useHasPermission } from '@app/Aplication/Hooks/useHasPermission';
import { Container } from '../Layout';
import {
  NavLink,
  NavLinkRenderProps,
  useLocation,
  useMatch,
  useNavigate,
} from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { useDevice } from '@app/Aplication/Hooks';
import { useEffect } from 'react';

export interface MenuItemProps {
  permission?: string | string[];
  text: string;
  icon?: IconDefinition;
  to: string;
  onlyMobile?: boolean;
  children?: React.ReactNode;
  redirect?: string;
}

export const styleLink =
  'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary';

export const MenuItem = ({ permission, ...props }: MenuItemProps) => {
  const { hasPermission } = useHasPermission();

  if (!permission) return <MenuItemElement {...props} />;
  return <>{hasPermission(permission) && <MenuItemElement {...props} />}</>;
};

const MenuItemElement = ({
  icon,
  text,
  to,
  onlyMobile = false,
  children,
  redirect,
}: Omit<MenuItemProps, 'permission'>) => {
  const { isMobile } = useDevice();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  // Para coincidencia parcial, podemos usar useMatch con pattern
  const partialMatch = useMatch(`${to}/*`);

  useEffect(() => {
    if (redirect && pathname === to && !isMobile) navigate(redirect);
  }, [isMobile, navigate, pathname, redirect, to]);

  const isActiveLink = ({ isActive }: NavLinkRenderProps): string => {
    return isActive ? styleLink + ' bg-muted' : styleLink;
  };

  if (!isMobile && onlyMobile) return null;

  return (
    <>
      <Container className="flex flex-col gap-2">
        <NavLink to={to} className={isActiveLink}>
          {icon && <FontAwesomeIcon icon={icon} />}
          {text}
        </NavLink>
      </Container>
      {children && partialMatch && (
        <Container space="none" className="pl-4">
          {children}
        </Container>
      )}
    </>
  );
};
