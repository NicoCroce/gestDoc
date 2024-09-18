import { executeUseCase } from '@server/Application';
import { GetDocuments, IGetDocuments } from '../Domain';

export class DocumentsService {
  constructor(private readonly _getDocuments: GetDocuments) {}

  async getDocuments({ input, requestContext }: IGetDocuments) {
    return executeUseCase({
      useCase: this._getDocuments,
      input,
      requestContext,
    });
  }
}
