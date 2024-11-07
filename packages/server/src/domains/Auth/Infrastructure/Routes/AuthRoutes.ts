import { authController } from '../../auth.app';

export const AuthRoutes = () => {
  const { login, logout, restorePassword, changePassword } = authController();

  return {
    auth: {
      login: login,
      logout,
      restorePassword,
      changePassword,
    },
  };
};
