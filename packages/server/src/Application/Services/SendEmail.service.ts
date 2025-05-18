import { Certificate } from '@server/domains/Certificates';
import { GetAdmins } from '@server/domains/Permissions/Domain/UseCases/GetAdmins.usecase';
import { GetUser } from '@server/domains/Users';
import { executeUseCase } from '../Adapters';
import { EmailSender } from '../Utils';
import { emailTemplates } from '../Utils/Email';
import { IRequestContext } from '../Interfaces';
import { RequestContext } from '../Entities';

interface IAddLicence extends IRequestContext {
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

export class SendEmailService {
  constructor(
    private readonly _getAdmins: GetAdmins,
    private readonly _getUser: GetUser,
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
    const currentUser = await this.getCurrentUser(requestContext);
    const admins = await this.getAdmins(requestContext);

    if (admins) {
      const { body, subject } = templateFn({
        ...templateArgs,
        currentUser: `${currentUser.values.name} ${currentUser.values.surname}`,
      });
      EmailSender({
        to: admins,
        body,
        subject,
      });
    }
  }

  async addLincence({ certificate, requestContext }: IAddLicence) {
    await this.sendEmailToAdmins({
      requestContext,
      templateFn: emailTemplates.addLicence,
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
}
