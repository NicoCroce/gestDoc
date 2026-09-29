import { executeUseCase, IRequestContext, IUseCase } from '@server/Application';
import { hasDisclaimerText } from '@server/Infrastructure';
import { GetDisclaimerText } from './GetDisclaimerText.usecase';

/**
 * Bandera a nivel empresa (owner): `true` si la empresa tiene texto de
 * términos con contenido real. Owner-scoped desde `RequestContext.values.ownerId`;
 * reutiliza `GetDisclaimerText` (mismo dominio) vía `executeUseCase` y aplica
 * la definición única de "sin texto" (`hasDisclaimerText`).
 */
export class HasDisclaimerText implements IUseCase<boolean> {
  constructor(private readonly _getDisclaimerText: GetDisclaimerText) {}

  async execute({ requestContext }: IRequestContext): Promise<boolean> {
    const ownerId = requestContext.values.ownerId;

    const text = await executeUseCase({
      useCase: this._getDisclaimerText,
      input: ownerId,
      requestContext,
    });

    return hasDisclaimerText(text);
  }
}
