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
import { AppError, RequestContext } from '../Entities';
import { GetAdmins } from '@server/domains/Permissions/Application';

interface IAddLicense extends IRequestContext {
  certificate: Certificate;
}

interface ISignDocument extends IRequestContext {
  documentId: number;
  agreement: boolean;
  reasonSignatureNonConformity: string | null;
}

interface ISendEmailsToAdmin<Targs> extends IRequestContext {
  templateFn: (args: Targs) => { body: string; subject: string };
  templateArgs: Targs;
}

interface ISendDocumentToEmail extends IRequestContext {
  documentId: number;
  documentTitle: string;
  pdfBuffer: Buffer;
}

interface INotifyLicenseStatusChange extends IRequestContext {
  certificate: Certificate;
  newStatus: 'aprobado' | 'rechazado';
  rejectionReason?: string;
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
    // No usa executeUseCase: ese adapter envuelve cualquier error en
    // TRPCError (ver TRPCErrorAdapter), lo que rompe el `instanceof AppError`
    // que necesitan los catch de sendDocumentToEmail/signDocument para
    // distinguir "usuario soft-deleted" (404) de un error real.
    return await this._getUser.execute({
      input: requestContext.values.userId,
      requestContext,
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

      if (admins.length > 0) {
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
      } else {
        loggerContext(requestContext.values).warn(
          'Email to admins skipped: no active admins found',
        );
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

  async sendDocumentToEmail({
    documentId,
    documentTitle,
    pdfBuffer,
    requestContext,
  }: ISendDocumentToEmail) {
    try {
      const currentUser = await this.getCurrentUser(requestContext);

      await this.mailNotificationService.sendOne({
        to: currentUser.values.mail,
        subject: `Documento: ${documentTitle}`,
        html: `<p>Adjunto encontrará el documento <strong>${documentTitle}</strong> (ID: ${documentId}).</p>`,
        attachments: [
          {
            filename: `${documentTitle}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf',
          },
        ],
      });
    } catch (error) {
      if (error instanceof AppError && error.statusCode === 404) {
        loggerContext(requestContext.values).warn(
          'Document email skipped: recipient not active',
        );
        return;
      }
      loggerContext(requestContext.values).error(
        error,
        'Failed to send document to email',
      );
    }
  }

  async signDocument({
    documentId,
    agreement,
    reasonSignatureNonConformity,
    requestContext,
  }: ISignDocument) {
    try {
      const currentUser = await this.getCurrentUser(requestContext);
      const admins = await this.getAdmins(requestContext);

      const employeeName =
        `${currentUser.values.name} ${currentUser.values.surname ?? ''}`.trim();

      // Enviar al empleado que firmó
      const employeeTemplate = emailTemplates.documentSignedEmployee({
        employeeName,
        documentId,
        agreement,
        reasonSignatureNonConformity,
      });

      await this.mailNotificationService.sendOne({
        to: currentUser.values.mail,
        subject: employeeTemplate.subject,
        html: employeeTemplate.body,
      });

      // Enviar a los admins
      if (admins.length > 0) {
        const adminTemplate = emailTemplates.documentSignedAdmin({
          employeeName,
          documentId,
          agreement,
          reasonSignatureNonConformity,
        });

        await this.mailNotificationService.sendOne({
          to: admins,
          subject: adminTemplate.subject,
          html: adminTemplate.body,
        });
      } else {
        loggerContext(requestContext.values).warn(
          'Document signing email to admins skipped: no active admins found',
        );
      }
    } catch (error) {
      if (error instanceof AppError && error.statusCode === 404) {
        loggerContext(requestContext.values).warn(
          'Document signing email skipped: recipient not active',
        );
        return;
      }
      loggerContext(requestContext.values).error(
        error,
        'Failed to send document signing email',
      );
    }
  }

  async notifyLicenseStatusChange({
    certificate,
    newStatus,
    rejectionReason,
    requestContext,
  }: INotifyLicenseStatusChange) {
    try {
      // No usa executeUseCase por el mismo motivo que getCurrentUser(): se
      // necesita el AppError original (statusCode 404) para distinguir
      // "empleado soft-deleted" en el catch.
      const employee = await this._getUser.execute({
        input: certificate.userId!,
        requestContext,
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
        rejectionReason,
      });

      await this.mailNotificationService.sendOne({
        to: employee.values.mail,
        subject,
        html: body,
      });
    } catch (error) {
      if (error instanceof AppError && error.statusCode === 404) {
        loggerContext(requestContext.values).warn(
          'License status email skipped: employee not active',
        );
        return;
      }
      loggerContext(requestContext.values).error(
        error,
        'Failed to send license status change email to employee',
      );
    }
  }
}
