import { executeUseCase } from '@server/Application';
import {
  GetDocument,
  GetDocuments,
  IGetDocument,
  IGetDocuments,
  ISignDocument,
  IViewDocument,
  SignDocument,
  ViewDocument,
} from '../Domain';

export class DocumentsService {
  constructor(
    private readonly _getDocuments: GetDocuments,
    private readonly _getDocument: GetDocument,
    private readonly _signDocument: SignDocument,
    private readonly _viewDocument: ViewDocument,
  ) {}

  getDocuments({ input, requestContext }: IGetDocuments) {
    return executeUseCase({
      useCase: this._getDocuments,
      input,
      requestContext,
    });
  }

  getDocument({ input, requestContext }: IGetDocument) {
    return executeUseCase({
      useCase: this._getDocument,
      input,
      requestContext,
    });
  }

  signDocument({ input, requestContext }: ISignDocument) {
    return executeUseCase({
      useCase: this._signDocument,
      input,
      requestContext,
    });
  }

  viewDocument({ input, requestContext }: IViewDocument) {
    return executeUseCase({
      useCase: this._viewDocument,
      input,
      requestContext,
    });
  }
}
