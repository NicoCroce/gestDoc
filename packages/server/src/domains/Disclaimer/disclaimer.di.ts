import { asClass } from 'awilix';
import {
  CountPendingDisclaimers,
  DisclaimerService,
  GetDisclaimerText,
  GetPendingDisclaimerAcceptances,
  GetSignatureStatus,
  SignDisclaimer,
  GetEmployeesByCompany,
  SendReminders,
} from './Application';
import {
  DisclaimerController,
  DisclaimerRepositoryImplementation,
  DisclaimerEmailService,
} from './Infrastructure';
import { container } from '@server/Infrastructure/di/Container';

// Nota: userRepository / _getEmailsByUsersId / _validateUserPassword NO se
// registran acá — ya los registra `Users/users.di.ts` en el mismo contenedor
// global de Awilix (InjectionMode.CLASSIC resuelve por nombre de parámetro).
// Ver skill cross-domain-relations: los use cases de Users se inyectan por
// caso de uso, nunca importando el repositorio de otro dominio.

export const disclaimerApp = {
  disclaimerRepository: asClass(DisclaimerRepositoryImplementation),
  disclaimerEmailService: asClass(DisclaimerEmailService),
  disclaimerService: asClass(DisclaimerService),
  disclaimerController: asClass(DisclaimerController),
  _getDisclaimerText: asClass(GetDisclaimerText),
  _getSignatureStatus: asClass(GetSignatureStatus),
  _signDisclaimer: asClass(SignDisclaimer),
  _getEmployeesByCompany: asClass(GetEmployeesByCompany),
  _sendReminders: asClass(SendReminders),
  // Reporte diario (daily-admin-report)
  _getPendingDisclaimerAcceptances: asClass(GetPendingDisclaimerAcceptances),
  _countPendingDisclaimers: asClass(CountPendingDisclaimers),
};

export const disclaimerController = () =>
  container.resolve<DisclaimerController>('disclaimerController');
