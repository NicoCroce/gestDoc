import { IUseCase } from '@server/Application';
import { Document } from '../Document.entity';
import { DocumentRepository } from '../Document.repository';
import { IGetDocument } from '../Document.interfaces';

export class GetDocument implements IUseCase<Document | null> {
  constructor(private readonly documentsRepository: DocumentRepository) {}

  execute({ input, requestContext }: IGetDocument): Promise<Document | null> {
    return this.documentsRepository.getDocument({
      id: input,
      requestContext,
    });
  }
}
