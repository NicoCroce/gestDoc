import { executeUseCase, IUseCase } from '@server/Application';
import { hasDisclaimerText } from '@server/Infrastructure';
import { GetEmailsByUsersId } from '@server/domains/Users';
import { OwnersysRepository } from '@server/domains/Ownersys';
import { DisclaimerRepository } from '../../Domain';
import { ISendReminders, ISendRemindersResponse } from '../disclaimer.types';

const BATCH_SIZE = 50;

export class SendReminders implements IUseCase<
  ISendRemindersResponse,
  ISendRemindersInput
> {
  constructor(
    private readonly disclaimerRepository: DisclaimerRepository,
    // Cross-domain: caso de uso de Users, no el repositorio (skill cross-domain-relations).
    private readonly _getEmailsByUsersId: GetEmailsByUsersId,
    private readonly disclaimerEmailService: ISendEmailService,
    private readonly ownersysRepository: OwnersysRepository,
  ) {}

  async execute({
    input,
    requestContext,
  }: ISendReminders): Promise<ISendRemindersResponse> {
    const ownerId = input.ownerId ?? requestContext.values.ownerId;

    const ownersys = await this.ownersysRepository.getOwnersys({
      id: ownerId,
      requestContext,
    });

    const disclaimerText = ownersys?.values.texto_disclaimer ?? '';
    const companyName = ownersys?.values.denominacion || '';

    // Guard alineado a la definición común de "sin texto" (nulo, vacío o solo
    // espacios/tabs/saltos): sin texto no existe el pendiente de términos.
    if (!hasDisclaimerText(disclaimerText)) {
      return { sent: 0, failed: 0, total: 0 };
    }

    const pendingIds =
      input.employeeIds && input.employeeIds.length > 0
        ? input.employeeIds
        : await this.disclaimerRepository.getPendingEmployeeIds({
            ownerId,
            requestContext,
          });

    let sent = 0;
    let failed = 0;

    for (let i = 0; i < pendingIds.length; i += BATCH_SIZE) {
      const batch = pendingIds.slice(i, i + BATCH_SIZE);
      try {
        const emails = await executeUseCase({
          useCase: this._getEmailsByUsersId,
          input: batch,
          requestContext,
        });

        await this.disclaimerEmailService.sendDisclaimerReminders({
          to: emails,
          disclaimerText,
          companyName,
        });

        sent += batch.length;
      } catch (error) {
        failed += batch.length;
        console.log(error);
      }
    }

    return { sent, failed, total: pendingIds.length };
  }
}

export interface ISendRemindersInput {
  ownerId?: number;
  employeeIds?: number[];
}

export interface ISendEmailService {
  sendDisclaimerReminders(params: {
    to: string[];
    disclaimerText: string;
    companyName: string;
  }): Promise<void>;
}
