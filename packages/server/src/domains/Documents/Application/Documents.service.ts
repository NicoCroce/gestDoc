import { executeUseCase } from '@server/Application';
import {
  GetDocument,
  GetDocuments,
  IGetDocument,
  IGetDocuments,
} from '../Domain';

export class DocumentsService {
  constructor(
    private readonly _getDocuments: GetDocuments,
    private readonly _getDocument: GetDocument,
  ) {}

  async getDocuments({ input, requestContext }: IGetDocuments) {
    return executeUseCase({
      useCase: this._getDocuments,
      input,
      requestContext,
    });
  }
  async getDocument({ input, requestContext }: IGetDocument) {
    return executeUseCase({
      useCase: this._getDocument,
      input,
      requestContext,
    });
  }
}
