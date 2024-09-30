import { IUseCase } from '@server/Application';
import { DocumentRepository } from '../Document.repository';
import { IViewDocument } from '../Document.interfaces';

export class ViewDocument implements IUseCase<number | null> {
  constructor(private readonly documentsRepository: DocumentRepository) {}

  execute({ input, requestContext }: IViewDocument): Promise<number | null> {
    return this.documentsRepository.viewDocument({
      id: input,
      requestContext,
    });
  }
}
