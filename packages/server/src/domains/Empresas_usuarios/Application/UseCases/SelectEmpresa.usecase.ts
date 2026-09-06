import { executeUseCase, IUseCase } from '@server/Application';
import { generateToken } from '@server/Infrastructure';
import { IEmpresasUsuariosRepository } from '../../Domain/EmpresasUsuarios.repository';
import {
  ISelectEmpresaInput,
  ISelectEmpresaOutput,
} from '../empresasUsuarios.types';
import { GetDisclaimerText } from '@server/domains/Disclaimer/Application/UseCases/GetDisclaimerText.usecase';
import { GetSignatureStatus } from '@server/domains/Disclaimer/Application/UseCases/GetSignatureStatus.usecase';

export class SelectEmpresa implements IUseCase<ISelectEmpresaOutput> {
  constructor(
    private readonly empresasUsuariosRepository: IEmpresasUsuariosRepository,
    private readonly _getDisclaimerText?: GetDisclaimerText,
    private readonly _getSignatureStatus?: GetSignatureStatus,
  ) {}

  async execute({
    input,
    requestContext,
  }: ISelectEmpresaInput): Promise<ISelectEmpresaOutput> {
    const { userId } = requestContext.values;
    const { empresaId } = input;

    const belongs = await this.empresasUsuariosRepository.belongsToEmpresa(
      userId,
      empresaId,
    );

    if (!belongs) {
      throw new Error('No tenés acceso a esta empresa');
    }

    const token = generateToken({ id: userId, ownerId: empresaId });

    let pendingDisclaimer = false;

    if (
      process.env.ENABLE_DISCLAIMER === 'true' &&
      this._getDisclaimerText &&
      this._getSignatureStatus
    ) {
      const disclaimerText = await executeUseCase({
        useCase: this._getDisclaimerText,
        input: empresaId,
        requestContext,
      });

      if (disclaimerText?.trim()) {
        const signatureStatus = await executeUseCase({
          useCase: this._getSignatureStatus,
          input: { userId, ownerId: empresaId },
          requestContext,
        });
        pendingDisclaimer = !signatureStatus || signatureStatus.corrupt;
      }
    }

    return { token, ownerId: empresaId, pendingDisclaimer };
  }
}
