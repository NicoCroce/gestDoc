import { asClass } from 'awilix';
import { SendEmailService } from './SendEmail.service';
import { MailNotificationService } from '@server/Infrastructure';

export const servicesApp = () => ({
  sendEmailService: asClass(SendEmailService),
  mailNotificationService: asClass(MailNotificationService),
});
