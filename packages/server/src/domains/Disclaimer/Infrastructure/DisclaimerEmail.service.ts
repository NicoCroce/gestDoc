import {
  MailNotificationService,
  type MailNotification,
  emailTemplates,
} from '@server/Infrastructure';
import { logger } from '@server/Infrastructure/utils/pino';
import { ISendEmailService } from '../Application/UseCases/SendReminders.usecase';

export class DisclaimerEmailService implements ISendEmailService {
  constructor(
    private readonly mailNotificationService: MailNotificationService,
  ) {}

  async sendDisclaimerReminders({
    to,
    disclaimerText,
    companyName,
  }: {
    to: string[];
    disclaimerText: string;
    companyName: string;
  }): Promise<void> {
    const notifications: MailNotification[] = to.map((email) => {
      const { body, subject } = emailTemplates.disclaimerReminder({
        employeeName: email,
        disclaimerText,
        companyName,
      });

      return { to: email, subject, html: body };
    });

    const { errors } = await this.mailNotificationService.send(notifications);

    for (const error of errors) {
      logger.error(error, 'Failed to send disclaimer reminder');
    }
  }
}
