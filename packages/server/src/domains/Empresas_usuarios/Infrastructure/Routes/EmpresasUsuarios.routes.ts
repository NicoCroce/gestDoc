import { empresasUsuariosController } from '../..';

export const EmpresasUsuariosRoutes = () => {
  const { getByUsuario } = empresasUsuariosController();

  return {
    empresasUsuarios: {
      getByUsuario: getByUsuario(),
    },
  };
};
