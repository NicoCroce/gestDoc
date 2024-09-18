import { container } from '@server/utils/Container';
import { DocumentsService } from '../Application/Documents.service';
import { DocumentsController } from './Controllers/Documents.controller';
import { asClass } from 'awilix';
import { DocumentsRepositoryImplementation } from './Database/DocumentsRepository.implementation.localDB';
import { GetDocuments } from '../Domain';

container.register({
  documentsRepository: asClass(DocumentsRepositoryImplementation),
  documentsService: asClass(DocumentsService),
  documentsController: asClass(DocumentsController),
  _getDocuments: asClass(GetDocuments),
});

export const documentsController = container.resolve<DocumentsController>(
  'documentsController',
);
