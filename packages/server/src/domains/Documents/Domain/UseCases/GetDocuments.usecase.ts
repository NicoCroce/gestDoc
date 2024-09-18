import { IUseCase, RequestContext } from '@server/Application';
import { Document } from '../Document.entity';
import { DocumentRepository } from '../Document.repository';
import { IGetDocuments } from '../Document.interfaces';

export class GetDocuments implements IUseCase<Document[], RequestContext> {
  constructor(private readonly documentsRepository: DocumentRepository) {}

  execute({ requestContext }: IGetDocuments): Promise<Document[]> {
    return this.documentsRepository.getDocuments({ requestContext });
  }
}
