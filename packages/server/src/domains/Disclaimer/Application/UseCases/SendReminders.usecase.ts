import { IUseCase } from '@server/Application';
import { UserRepository } from '@server/domains/Users';
import { OwnersyssRepository } from '@server/domains/Ownersyss';
import { DisclaimerRepository } from '../../Domain';
import { ISendReminders, ISendRemindersResponse } from '../disclaimer.types';

const BATCH_SIZE = 50;

export class SendReminders implements IUseCase<
  ISendRemindersResponse,
  ISendRemindersInput
> {
  constructor(
    private readonly disclaimerRepository: DisclaimerRepository,
    private readonly userRepository: UserRepository,
    private readonly disclaimerEmailService: ISendEmailService,
    private readonly ownersyssRepository: OwnersyssRepository,
  ) {}

  async execute({
    input,
    requestContext,
  }: ISendReminders): Promise<ISendRemindersResponse> {
    const ownerId = input.ownerId ?? requestContext.values.ownerId;

    const pendingIds =
      input.employeeIds && input.employeeIds.length > 0
        ? input.employeeIds
        : await this.disclaimerRepository.getPendingEmployeeIds({
            ownerId,
            requestContext,
          });

    const ownersys = await this.ownersyssRepository.getOwnersys({
      id: ownerId,
      requestContext,
    });

    const disclaimerText = ownersys?.values.texto_disclaimer || '';
    const companyName = ownersys?.values.denominacion || '';

    let sent = 0;
    let failed = 0;

    for (let i = 0; i < pendingIds.length; i += BATCH_SIZE) {
      const batch = pendingIds.slice(i, i + BATCH_SIZE);
      try {
        const emails = await this.userRepository.getEmailsByUsersId({
          userIds: batch,
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
