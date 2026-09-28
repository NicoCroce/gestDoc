import { asClass } from 'awilix';
import {
  OwnersysService,
  ChangeTheme,
  GetOwnerTheme,
  GetOwnersys,
} from './Application';
import {
  OwnersysController,
  OwnersysRepositoryImplementation,
} from './Infrastructure';
import { container } from '@server/Infrastructure/di/Container';

export const ownersysApp = {
  ownersysRepository: asClass(OwnersysRepositoryImplementation),
  ownersysService: asClass(OwnersysService),
  ownersysController: asClass(OwnersysController),
  _getOwnersys: asClass(GetOwnersys),
  _changeTheme: asClass(ChangeTheme),
  _getOwnerTheme: asClass(GetOwnerTheme),
};

export const ownersysController = () =>
  container.resolve<OwnersysController>('ownersysController');
