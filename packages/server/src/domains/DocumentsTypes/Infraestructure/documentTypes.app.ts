import { container } from '@server/utils/Container';
import { GetDocumentsTypes } from '../Domain';
import { asClass } from 'awilix';
import { DocumentTypesService } from '../Application';
import { DocumentsTypesController } from './Controllers';
import { DocumentsTypesRespositoryImplementation } from './Database';

container.register({
  documentsTypesRepository: asClass(DocumentsTypesRespositoryImplementation),
  documentsTypesService: asClass(DocumentTypesService),
  documentsTypesController: asClass(DocumentsTypesController),
  _getDocumentsTypes: asClass(GetDocumentsTypes),
});

export const documentsTypesController =
  container.resolve<DocumentsTypesController>('documentsTypesController');
