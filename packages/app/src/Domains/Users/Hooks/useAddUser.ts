import { toast } from 'sonner';
import { UsersService } from '../Users.service';
import { useCacheUsers } from './useCacheUsers';

export const useAddUser = () => {
  //**  Accedo a los datos almacenados en tRPC. */
  const cacheUserList = useCacheUsers();

  return UsersService.create.useMutation({
    onMutate: async ({ name, mail }) => {
      cacheUserList.cancel();
      const preservedState = cacheUserList.getData();
      type TData = typeof preservedState;

      const setState = (state: TData): TData => [
        ...(state || []),
        {
          id: state?.length,
          name,
          mail,
          renewPassword: undefined,
          companyLogo: undefined,
          companyName: undefined,
          userImage: undefined,
        },
      ];

      cacheUserList.setData(undefined, setState);
      return { preservedState };
    },
    onError: (_err, _variables, context) => {
      toast.error('Usuario no agregado');
      cacheUserList.setData(undefined, context?.preservedState);
    },
    onSuccess: () => {
      toast.success('Usuario agregado');
      cacheUserList.invalidate();
    },
  });
};
