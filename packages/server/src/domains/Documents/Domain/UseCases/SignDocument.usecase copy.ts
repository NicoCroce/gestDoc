import { AppError, executeUseCase, IUseCase } from '@server/Application';
import { DocumentRepository } from '../Document.repository';
import { ISignDocument } from '../Document.interfaces';
import { ValidateUserPassword } from '@server/domains/Auth';

export class SignDocument implements IUseCase<void> {
  constructor(
    private readonly documentsRepository: DocumentRepository,
    private readonly _validateUserPassword: ValidateUserPassword,
  ) {}

  async execute({ input, requestContext }: ISignDocument): Promise<void> {
    const user = await executeUseCase({
      useCase: this._validateUserPassword,
      input: {
        id: requestContext.values.userId,
        password: input.password,
      },
      requestContext,
    });

    const document = this.documentsRepository.signDocument({
      id: input.documentId,
      validationSign: user.password || '',
      requestContext,
      agreement: input.agreement,
    });

    if (!document) {
      throw new AppError('No se puede firmar el documento');
    }
  }
}
