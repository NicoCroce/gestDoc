import { executeUseCase } from '@server/Application';
import { GetEmpresasByUsuario } from './UseCases';
import {
  IGetEmpresasByUsuarioInput,
  IGetEmpresasByUsuarioOutput,
} from './empresasUsuarios.types';

export class EmpresasUsuariosService {
  constructor(private readonly _getEmpresasByUsuario: GetEmpresasByUsuario) {}

  async getByUsuario({
    input,
    requestContext,
  }: IGetEmpresasByUsuarioInput): Promise<IGetEmpresasByUsuarioOutput | null> {
    return executeUseCase({
      useCase: this._getEmpresasByUsuario,
      input,
      requestContext,
    });
  }
}
