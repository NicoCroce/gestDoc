import { IUseCase } from '@server/Application';
import { DocumentType } from '../DocumentType.entity';
import { DocumentsTypeRepository } from '../DocumentType.repository';
import { IGetDocumentsTypes } from '../DocumentType.interfaces';

export class GetDocumentsTypes implements IUseCase<DocumentType[]> {
  constructor(
    private readonly documentsTypesRepository: DocumentsTypeRepository,
  ) {}

  execute({ requestContext }: IGetDocumentsTypes): Promise<DocumentType[]> {
    return this.documentsTypesRepository.getDocumentsTypes({
      requestContext,
    });
  }
}
