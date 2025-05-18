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
import { SendEmailService } from '@server/Application/Services/SendEmail.service';

export class DocumentsService {
  constructor(
    private readonly _getDocuments: GetDocuments,
    private readonly _getDocument: GetDocument,
    private readonly _signDocument: SignDocument,
    private readonly _viewDocument: ViewDocument,
    private readonly _getDocumentsByCompany: GetDocumentsByCompany,
    private readonly _getStatisticsDocuments: GetStatisticsDocuments,
    private readonly sendEmailService: SendEmailService,
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

  async signDocument({ input, requestContext }: ISignDocument) {
    const documentId = await executeUseCase({
      useCase: this._signDocument,
      input,
      requestContext,
    });

    const { agreement, reasonSignatureNonConformity } = input;

    if (!agreement) {
      this.sendEmailService.signDocument({
        documentId,
        reason: reasonSignatureNonConformity!,
        requestContext,
      });
    }

    return documentId;
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
