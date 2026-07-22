import { EmailSender, emailTemplates } from '@server/Infrastructure';
import { logger } from '@server/Infrastructure/utils/pino';
import { ISendEmailService } from '../Application/UseCases/SendReminders.usecase';

export class DisclaimerEmailService implements ISendEmailService {
  async sendDisclaimerReminders({
    to,
    disclaimerText,
    companyName,
  }: {
    to: string[];
    disclaimerText: string;
    companyName: string;
  }): Promise<void> {
    for (const email of to) {
      try {
        const { body, subject } = emailTemplates.disclaimerReminder({
          employeeName: email,
          disclaimerText,
          companyName,
        });
        await EmailSender({
          to: [email],
          body,
          subject,
        });
      } catch (error) {
        logger.error(error, `Failed to send disclaimer reminder to ${email}`);
      }
    }
  }
}
