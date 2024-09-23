import { protectedProcedure } from '@server/Infrastructure';
import { DocumentsService } from '../../Application/Documents.service';
import { executeService } from '@server/Application';
import z from 'zod';

export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  getDocuments = protectedProcedure
    .input(
      z.object({
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
      }),
    )
    .query(
      executeService(
        this.documentsService.getDocuments.bind(this.documentsService),
      ),
    );

  getDocument = protectedProcedure
    .input(z.string())
    .query(
      executeService(
        this.documentsService.getDocument.bind(this.documentsService),
      ),
    );
}
