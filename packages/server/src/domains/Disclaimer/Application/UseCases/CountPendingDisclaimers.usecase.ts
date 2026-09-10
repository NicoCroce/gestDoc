import { IRequestContext, IUseCase } from '@server/Application';
import { DisclaimerRepository } from '../../Domain';
import { IsDisclaimerEnabled } from './IsDisclaimerEnabled.usecase';

/**
 * Conteo de empleados que no aceptaron los términos (sección 7 del reporte
 * diario). Consumido por el dominio DailyReport vía inyección de dependencia.
 */
export class CountPendingDisclaimers implements IUseCase<number> {
  constructor(
    private readonly disclaimerRepository: DisclaimerRepository,
    private readonly _isDisclaimerEnabled: IsDisclaimerEnabled,
  ) {}

  async execute({ requestContext }: IRequestContext): Promise<number> {
    const enabled = await this._isDisclaimerEnabled.execute({
      input: requestContext.values.ownerId,
      requestContext,
    });

    if (!enabled) return 0;

    return this.disclaimerRepository.countPendingDisclaimers({
      requestContext,
    });
  }
}
