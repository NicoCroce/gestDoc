import { protectedProcedure } from '@server/Infrastructure';
import { DocumentsService } from '../../Application/Documents.service';
import { executeServiceAlone } from '@server/Application';

export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  getDocuments = protectedProcedure.query(
    executeServiceAlone(
      this.documentsService.getDocuments.bind(this.documentsService),
    ),
  );
}
