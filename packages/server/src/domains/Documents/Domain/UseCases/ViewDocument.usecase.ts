import { IUseCase } from '@server/Application';
import { DocumentRepository } from '../Document.repository';
import { IViewDocument } from '../Document.interfaces';

export class ViewDocument implements IUseCase<void | null> {
  constructor(private readonly documentsRepository: DocumentRepository) {}

  execute({ input, requestContext }: IViewDocument): Promise<void | null> {
    return this.documentsRepository.viewDocument({
      id: input,
      requestContext,
    });
  }
}
