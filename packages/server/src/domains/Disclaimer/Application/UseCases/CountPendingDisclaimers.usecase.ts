import { executeUseCase, IRequestContext, IUseCase } from '@server/Application';
import { DisclaimerRepository } from '../../Domain';
import { HasDisclaimerText } from './HasDisclaimerText.usecase';

/**
 * Conteo de empleados que no aceptaron los términos (sección 7 del reporte
 * diario). Consumido por el dominio DailyReport vía inyección de dependencia.
 */
export class CountPendingDisclaimers implements IUseCase<number> {
  constructor(
    private readonly disclaimerRepository: DisclaimerRepository,
    private readonly _hasDisclaimerText: HasDisclaimerText,
  ) {}

  async execute({ requestContext }: IRequestContext): Promise<number> {
    // Sin texto de términos no hay pendiente: se propaga 0 al resumen
    // estadístico (FR-005) sin tocar GetStatisticalSummary.
    const hasText = await executeUseCase({
      useCase: this._hasDisclaimerText,
      requestContext,
    });

    if (!hasText) {
      return 0;
    }

    return this.disclaimerRepository.countPendingDisclaimers({
      requestContext,
    });
  }
}
