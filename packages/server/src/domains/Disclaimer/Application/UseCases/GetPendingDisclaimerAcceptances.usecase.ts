import { IRequestContext, IUseCase } from '@server/Application';
import {
  DisclaimerRepository,
  IPendingDisclaimerAcceptanceRecord,
} from '../../Domain';
import { IsDisclaimerEnabled } from './IsDisclaimerEnabled.usecase';

/**
 * Sección 4 del reporte diario: empleados que no aceptaron los términos.
 * Consumido por el dominio DailyReport vía inyección de dependencia.
 */
export class GetPendingDisclaimerAcceptances implements IUseCase<
  IPendingDisclaimerAcceptanceRecord[]
> {
  constructor(
    private readonly disclaimerRepository: DisclaimerRepository,
    private readonly _isDisclaimerEnabled: IsDisclaimerEnabled,
  ) {}

  async execute({
    requestContext,
  }: IRequestContext): Promise<IPendingDisclaimerAcceptanceRecord[]> {
    const enabled = await this._isDisclaimerEnabled.execute({
      input: requestContext.values.ownerId,
      requestContext,
    });

    if (!enabled) return [];

    return this.disclaimerRepository.getEmployeesWithoutDisclaimerAcceptance({
      requestContext,
    });
  }
}
