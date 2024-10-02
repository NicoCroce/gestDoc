import { IRequestContext } from '@server/Application';
import { DocumentType } from './DocumentType.entity';

export interface IGetDocumentsTypesRepository extends IRequestContext {}

export interface DocumentsTypeRepository {
  getDocumentsTypes(
    params: IGetDocumentsTypesRepository,
  ): Promise<DocumentType[]>;
}
