import { executeUseCase } from '@server/Application';
import {
  GetDocument,
  GetDocuments,
  GetDocumentsByCompany,
  GetStatisticsDocuments,
  IGetDocument,
  IGetDocuments,
  IGetDocumentsByCompany,
  IGetStatisticsDocuments,
  IGetStatisticsDocumentsResponse,
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
    private readonly _getDocumentsByCompany: GetDocumentsByCompany,
    private readonly _getStatisticsDocuments: GetStatisticsDocuments,
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

  async getDocumentsByCompany({
    input,
    requestContext,
  }: IGetDocumentsByCompany) {
    return executeUseCase({
      useCase: this._getDocumentsByCompany,
      input,
      requestContext,
    });
  }

  async getStatisticsDocuments({
    requestContext,
  }: IGetStatisticsDocuments): Promise<IGetStatisticsDocumentsResponse> {
    return executeUseCase({
      useCase: this._getStatisticsDocuments,
      requestContext,
    });
  }
}
