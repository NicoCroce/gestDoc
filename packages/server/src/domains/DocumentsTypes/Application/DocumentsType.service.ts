import { executeUseCase } from '@server/Application';
import { DocumentType, GetDocumentsTypes, IGetDocumentsTypes } from '../Domain';

export class DocumentTypesService {
  constructor(private readonly _getDocumentsTypes: GetDocumentsTypes) {}

  getDocumentsType({
    requestContext,
  }: IGetDocumentsTypes): Promise<DocumentType[]> {
    return executeUseCase({
      useCase: this._getDocumentsTypes,
      requestContext,
    });
  }
}
