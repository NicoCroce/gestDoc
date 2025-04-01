import { MenuItem, useDevice } from '@app/Aplication';
import { USERS_CHANGE_PASSWORD } from '../Users';
import {
  faArrowRightFromBracket,
  faUser,
} from '@fortawesome/free-solid-svg-icons';

export const MenuAuth = () => {
  const { isDesktop } = useDevice();
  return (
    <>
      {isDesktop && (
        <MenuItem to={USERS_CHANGE_PASSWORD} icon={faUser} text="Mi Cueta" />
      )}
      <MenuItem to="/" icon={faArrowRightFromBracket} text="Salir" />
    </>
  );
};
