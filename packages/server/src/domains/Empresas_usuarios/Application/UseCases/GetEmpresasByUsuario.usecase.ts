import { IUseCase } from '@server/Application';
import { IEmpresasUsuariosRepository } from '../../Domain/EmpresasUsuarios.repository';
import {
  IGetEmpresasByUsuarioInput,
  IGetEmpresasByUsuarioOutput,
  EmpresaItem,
} from '../empresasUsuarios.types';

export class GetEmpresasByUsuario implements IUseCase<IGetEmpresasByUsuarioOutput> {
  constructor(
    private readonly empresasUsuariosRepository: IEmpresasUsuariosRepository,
  ) {}

  async execute({
    input,
  }: IGetEmpresasByUsuarioInput): Promise<IGetEmpresasByUsuarioOutput> {
    const empresasUsuarios =
      await this.empresasUsuariosRepository.findByUsuario(input.userId);

    const empresas: EmpresaItem[] = empresasUsuarios
      .map((eu) => {
        const { id_empresa, razon_social, cuit, logo } = eu.values;
        if (
          razon_social === undefined ||
          cuit === undefined ||
          logo === undefined
        ) {
          return null;
        }
        return {
          id: id_empresa,
          razon_social,
          cuit,
          logo: logo ?? null,
        };
      })
      .filter((item): item is EmpresaItem => item !== null);

    return empresas;
  }
}
