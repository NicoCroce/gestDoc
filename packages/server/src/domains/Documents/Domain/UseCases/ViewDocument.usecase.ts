import { AppError, IUseCase } from '@server/Application';
import { DocumentRepository } from '../Document.repository';
import { IViewDocument } from '../Document.interfaces';

export class ViewDocument implements IUseCase<void> {
  constructor(private readonly documentsRepository: DocumentRepository) {}

  async execute({ input, requestContext }: IViewDocument): Promise<void> {
    const document = await this.documentsRepository.viewDocument({
      id: input,
      requestContext,
    });

    if (!document) {
      throw new AppError('No se pude ver el documento');
    }
  }
}
