import { container } from '@server/utils/Container';
import { DocumentsService } from './Application/Documents.service';
import { DocumentsController } from './Infrastructure/Controllers/Documents.controller';
import { asClass } from 'awilix';
import {
  GetDocument,
  GetDocuments,
  SignDocument,
  ViewDocument,
} from './Domain';
import { DocumentsRepositoryImplementation } from './Infrastructure';

export const documentsApp = {
  documentsRepository: asClass(DocumentsRepositoryImplementation),
  documentsService: asClass(DocumentsService),
  documentsController: asClass(DocumentsController),
  _getDocuments: asClass(GetDocuments),
  _getDocument: asClass(GetDocument),
  _signDocument: asClass(SignDocument),
  _viewDocument: asClass(ViewDocument),
};

export const documentsController = () =>
  container.resolve<DocumentsController>('documentsController');
