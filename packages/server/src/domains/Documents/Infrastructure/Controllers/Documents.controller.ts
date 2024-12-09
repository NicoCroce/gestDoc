import { protectedProcedure } from '@server/Infrastructure';
import { DocumentsService } from '../../Application/Documents.service';
import { executeService } from '@server/Application';
import z from 'zod';

const params = z.object({
  requireSign: z.boolean().nullable().default(null),
  type: z.string().default(''),
  title: z.string().default(''),
  date: z
    .string()
    .transform((arg) => new Date(arg))
    .or(z.date())
    .nullable()
    .default(null),
  signed: z.boolean().nullable().default(null),
  view: z.boolean().nullable().default(null),
  state: z.enum(['validados', 'pendientes']).default('pendientes'),
});
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  getDocuments = protectedProcedure
    .input(params)
    .query(
      executeService(
        this.documentsService.getDocuments.bind(this.documentsService),
      ),
    );

  getDocument = protectedProcedure
    .input(z.number())
    .query(
      executeService(
        this.documentsService.getDocument.bind(this.documentsService),
      ),
    );

  viewDocument = protectedProcedure
    .input(z.number())
    .mutation(
      executeService(
        this.documentsService.viewDocument.bind(this.documentsService),
      ),
    );

  signDocument = protectedProcedure
    .input(
      z.object({
        documentId: z.number(),
        password: z.string(),
        agreement: z.boolean(),
        reasonSignatureNonConformity: z.string().nullable(),
      }),
    )
    .mutation(
      executeService(
        this.documentsService.signDocument.bind(this.documentsService),
      ),
    );

  getDocumentsByCompany = protectedProcedure
    .input(params)
    .query(
      executeService(
        this.documentsService.getDocumentsByCompany.bind(this.documentsService),
      ),
    );

  getStatisticsDocuments = protectedProcedure.query(
    executeService(
      this.documentsService.getStatisticsDocuments.bind(this.documentsService),
    ),
  );
}
