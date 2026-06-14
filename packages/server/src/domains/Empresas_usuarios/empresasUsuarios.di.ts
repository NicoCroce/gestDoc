import { asClass } from 'awilix';
import { EmpresasUsuariosService, GetEmpresasByUsuario } from './Application';
import {
  EmpresasUsuariosController,
  EmpresasUsuariosRepositoryImplementation,
} from './Infrastructure';
import { container } from '@server/Infrastructure/di/Container';

export const empresasUsuariosApp = {
  empresasUsuariosRepository: asClass(EmpresasUsuariosRepositoryImplementation),
  empresasUsuariosService: asClass(EmpresasUsuariosService),
  empresasUsuariosController: asClass(EmpresasUsuariosController),
  _getEmpresasByUsuario: asClass(GetEmpresasByUsuario),
};

export const empresasUsuariosController = () =>
  container.resolve<EmpresasUsuariosController>('empresasUsuariosController');
