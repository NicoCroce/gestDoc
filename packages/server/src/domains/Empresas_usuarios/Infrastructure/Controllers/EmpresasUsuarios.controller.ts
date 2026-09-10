import { protectedProcedure } from '@server/Infrastructure';
import { EmpresasUsuariosService } from '../../Application/EmpresasUsuarios.service';
import {
  GetEmpresasByUsuarioInputSchema,
  SelectEmpresaInputSchema,
  SelectEmpresaOutputSchema,
} from '../../Application/empresasUsuarios.types';
import { executeService, executeServiceWithCookie } from '@server/Application';

const SelectEmpresaResponseSchema = SelectEmpresaOutputSchema.omit({
  token: true,
});

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

  selectEmpresa = () =>
    protectedProcedure
      .input(SelectEmpresaInputSchema)
      .output(SelectEmpresaResponseSchema)
      .mutation(
        executeServiceWithCookie(
          this.empresasUsuariosService.selectEmpresa.bind(
            this.empresasUsuariosService,
          ),
        ),
      );
}
