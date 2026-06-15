import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useGlobalStore } from '@app/Application';
import { TUserLogged } from '@app/Domains/Users';
import { DOCUMENTS_ROUTE } from '@app/Domains/Documents';
import { EmpresasUsuariosService } from '../EmpresasUsuarios.service';

export const useSelectEmpresa = () => {
  const navigate = useNavigate();
  const { setQueryData } = useGlobalStore<TUserLogged>('dataUser');

  return EmpresasUsuariosService.selectEmpresa.useMutation({
    onSuccess: (data) => {
      setQueryData((prev) => ({ ...prev!, ownerId: data.ownerId }));
      navigate(DOCUMENTS_ROUTE);
    },
    onError: (error: { message: string }) => {
      toast.error(error.message);
    },
  });
};
