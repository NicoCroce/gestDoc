import { executeUseCase, IRequestContext, IUseCase } from '@server/Application';
import {
  DisclaimerRepository,
  IPendingDisclaimerAcceptanceRecord,
} from '../../Domain';
import { HasDisclaimerText } from './HasDisclaimerText.usecase';

/**
 * Sección 4 del reporte diario: empleados que no aceptaron los términos.
 * Consumido por el dominio DailyReport vía inyección de dependencia.
 */
export class GetPendingDisclaimerAcceptances implements IUseCase<
  IPendingDisclaimerAcceptanceRecord[]
> {
  constructor(
    private readonly disclaimerRepository: DisclaimerRepository,
    private readonly _hasDisclaimerText: HasDisclaimerText,
  ) {}

  async execute({
    requestContext,
  }: IRequestContext): Promise<IPendingDisclaimerAcceptanceRecord[]> {
    // Sin texto de términos en la empresa no existe el pendiente de aceptación
    // (FR-005/FR-009): se corta antes de consultar el repositorio.
    const hasText = await executeUseCase({
      useCase: this._hasDisclaimerText,
      requestContext,
    });

    if (!hasText) {
      return [];
    }

    return this.disclaimerRepository.getEmployeesWithoutDisclaimerAcceptance({
      requestContext,
    });
  }
}
