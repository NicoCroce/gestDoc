import { protectedProcedure } from '@server/Infrastructure';
import { executeService } from '@server/Application';
import { EmpresasUsuariosService } from '../../Application/EmpresasUsuarios.service';
import { GetEmpresasByUsuarioInputSchema } from '../../Application/empresasUsuarios.types';

export class EmpresasUsuariosController {
  constructor(
    private readonly empresasUsuariosService: EmpresasUsuariosService,
  ) {}

  getByUsuario = () =>
    protectedProcedure
      .input(GetEmpresasByUsuarioInputSchema)
      .query(
        executeService(
          this.empresasUsuariosService.getByUsuario.bind(
            this.empresasUsuariosService,
          ),
        ),
      );
}
