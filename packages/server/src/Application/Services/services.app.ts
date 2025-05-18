import { asClass } from 'awilix';
import { SendEmailService } from './SendEmail.service';

export const servicesApp = () => ({
  sendEmailService: asClass(SendEmailService),
});
