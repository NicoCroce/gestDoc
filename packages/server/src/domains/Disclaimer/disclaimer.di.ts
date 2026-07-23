import { asClass } from 'awilix';
import {
  DisclaimerService,
  GetDisclaimerText,
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
import { UsersRepositoryImplementation } from '@server/domains/Users/Infrastructure';
import { container } from '@server/Infrastructure/di/Container';

export const disclaimerApp = {
  disclaimerRepository: asClass(DisclaimerRepositoryImplementation),
  userRepository: asClass(UsersRepositoryImplementation),
  disclaimerEmailService: asClass(DisclaimerEmailService),
  disclaimerService: asClass(DisclaimerService),
  disclaimerController: asClass(DisclaimerController),
  _getDisclaimerText: asClass(GetDisclaimerText),
  _getSignatureStatus: asClass(GetSignatureStatus),
  _signDisclaimer: asClass(SignDisclaimer),
  _getEmployeesByCompany: asClass(GetEmployeesByCompany),
  _sendReminders: asClass(SendReminders),
};

export const disclaimerController = () =>
  container.resolve<DisclaimerController>('disclaimerController');
