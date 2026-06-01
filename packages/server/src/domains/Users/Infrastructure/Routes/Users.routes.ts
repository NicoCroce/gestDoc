import { usersController } from '../../user.app';

export const UserRoutes = () => {
  const { changePassword } = usersController();

  return {
    users: {
      changePassword: changePassword(),
    },
  };
};
