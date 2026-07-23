import { Certificate } from '@server/domains/Certificates';
import { GetUser } from '@server/domains/Users';
import { executeUseCase } from '../Adapters';
import { getDateString } from '../Utils';
import {
  MailNotificationService,
  emailTemplates,
} from '@server/Infrastructure';
import { loggerContext } from '@server/Infrastructure/utils/pino';
import { IRequestContext } from '../Interfaces';
import { RequestContext } from '../Entities';
import { GetAdmins } from '@server/domains/Permissions/Application';

interface IAddLicense extends IRequestContext {
  certificate: Certificate;
}

interface ISignDocument extends IRequestContext {
  documentId: number;
  reason: string;
}

interface ISendEmailsToAdmin<Targs> extends IRequestContext {
  templateFn: (args: Targs) => { body: string; subject: string };
  templateArgs: Targs;
}

interface INotifyLicenseStatusChange extends IRequestContext {
  certificate: Certificate;
  newStatus: 'aprobado' | 'rechazado';
}

export class SendEmailService {
  constructor(
    private readonly _getAdmins: GetAdmins,
    private readonly _getUser: GetUser,
    private readonly mailNotificationService: MailNotificationService,
  ) {}

  private async getAdmins(requestContext: RequestContext) {
    return await executeUseCase({
      useCase: this._getAdmins,
      requestContext,
    });
  }

  private async getCurrentUser(requestContext: RequestContext) {
    return await executeUseCase({
      useCase: this._getUser,
      requestContext,
      input: requestContext.values.userId,
    });
  }

  private async sendEmailToAdmins<Targs>({
    requestContext,
    templateFn,
    templateArgs,
  }: ISendEmailsToAdmin<Targs>) {
    try {
      const currentUser = await this.getCurrentUser(requestContext);
      const admins = await this.getAdmins(requestContext);

      if (admins) {
        const { body, subject } = templateFn({
          ...templateArgs,
          currentUser:
            `${currentUser.values.name} ${currentUser.values.surname ?? ''}`.trim(),
        });
        await this.mailNotificationService.sendOne({
          to: admins,
          subject,
          html: body,
        });
      }
    } catch (error) {
      loggerContext(requestContext.values).error(
        error,
        'Failed to send email to admins',
      );
    }
  }

  async addLincence({ certificate, requestContext }: IAddLicense) {
    await this.sendEmailToAdmins({
      requestContext,
      templateFn: emailTemplates.addLicense,
      templateArgs: {
        reason: certificate.values.reason,
        currentUser: '',
      },
    });
  }

  async signDocument({ reason, documentId, requestContext }: ISignDocument) {
    await this.sendEmailToAdmins({
      requestContext,
      templateFn: emailTemplates.signDocument,
      templateArgs: {
        reason,
        documentId,
        currentUser: '',
      },
    });
  }

  async notifyLicenseStatusChange({
    certificate,
    newStatus,
    requestContext,
  }: INotifyLicenseStatusChange) {
    try {
      const employee = await executeUseCase({
        useCase: this._getUser,
        requestContext,
        input: certificate.userId!,
      });

      const reviewer = await this.getCurrentUser(requestContext);

      const reviewerName =
        `${reviewer.values.name} ${reviewer.values.surname ?? ''}`.trim();
      const employeeName =
        `${employee.values.name} ${employee.values.surname ?? ''}`.trim();

      const { startDate, endDate, returnDate, reason, type } =
        certificate.values;

      const { body, subject } = emailTemplates.licenseStatusChange({
        employeeName,
        reviewerName,
        licenseType: type.values.name ?? '',
        startDate: getDateString(startDate),
        endDate: getDateString(endDate),
        returnDate: getDateString(returnDate),
        reason,
        status: newStatus,
      });

      await this.mailNotificationService.sendOne({
        to: employee.values.mail,
        subject,
        html: body,
      });
    } catch (error) {
      loggerContext(requestContext.values).error(
        error,
        'Failed to send license status change email to employee',
      );
    }
  }
}
