import { ownersysController } from '../..';

export const OwnersysRoutes = () => {
  const { updateTheme, getOwnerTheme, getOwnersys } = ownersysController();

  return {
    ownersys: {
      get: getOwnersys(),

      changeTheme: updateTheme(),
      getOwnerTheme: getOwnerTheme(),
    },
  };
};
