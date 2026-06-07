import { toast } from 'sonner';
import { AuthService } from '../Auth.service';
import { useNavigate } from 'react-router-dom';
import { setLogged } from '@app/Aplication/Helpers/isLogged';
import { useGlobalStore } from '@app/Aplication';
import { DOCUMENTS_ROUTE } from '@app/Domains/Documents';
import { TUserLogged } from '@app/Domains/Users';

export const useLoginUser = () => {
  const navigate = useNavigate();
  const { setQueryData } = useGlobalStore<TUserLogged>('dataUser');

  return AuthService.login.useMutation({
    onError(error) {
      toast.error(error.message);
    },
    onSuccess: (data) => {
      setLogged();
      setQueryData(data);
      navigate(DOCUMENTS_ROUTE);
    },
  });
};
