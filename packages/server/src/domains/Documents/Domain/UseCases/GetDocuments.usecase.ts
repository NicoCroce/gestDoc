import { IUseCase } from '@server/Application';
import { Document } from '../Document.entity';
import { DocumentRepository } from '../Document.repository';
import { IGetDocuments } from '../Document.interfaces';

export class GetDocuments implements IUseCase<Document[]> {
  constructor(private readonly documentsRepository: DocumentRepository) {}

  execute({ input, requestContext }: IGetDocuments): Promise<Document[]> {
    return this.documentsRepository.getDocuments({
      filters: input,
      requestContext,
    });
  }
}
