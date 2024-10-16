import { useEffect } from 'react';
import { AuthService } from '../Auth.service';
import { isLogged } from '@app/Aplication/Helpers/isLogged';
import { removeLoggedUser } from '@app/Aplication';
import { clear } from 'idb-keyval';

const clearStore = () =>
  setTimeout(() => {
    localStorage.removeItem('logged');
    removeLoggedUser();
    clear();
  }, 1000);

export const useLogout = () => {
  const { mutate } = AuthService.logout.useMutation();

  useEffect(() => {
    if (isLogged()) {
      clearStore();
      mutate();
    }
  }, [mutate]);

  return;
};
