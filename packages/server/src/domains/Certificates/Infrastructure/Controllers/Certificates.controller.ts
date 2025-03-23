import { protectedProcedure } from '@server/Infrastructure';
import { CertificatesServices } from '../../Application';
import { executeService } from '@server/Application';
import z from 'zod';

const filterParams = z.object({
  employee: z.string().optional(),
  date: z
    .string()
    .transform((arg) => new Date(arg))
    .or(z.date())
    .optional(),
  type: z.number().optional(),
});
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesServices) {}

  getCertificates = protectedProcedure
    .input(filterParams.optional())
    .query(
      executeService(
        this.certificatesService.getCertificates.bind(this.certificatesService),
      ),
    );

  getCertificateTypes = protectedProcedure.query(
    executeService(
      this.certificatesService.getCertificateTypes.bind(
        this.certificatesService,
      ),
    ),
  );

  addCertificate = protectedProcedure
    .input(
      z.object({
        startDate: z.string(),
        endDate: z.string(),
        reason: z.string(),
        type: z.number(),
      }),
    )
    .mutation(
      executeService(
        this.certificatesService.addCertificate.bind(this.certificatesService),
      ),
    );

  getCertificatesByCompany = protectedProcedure.query(
    executeService(
      this.certificatesService.getCertificatesByCompany.bind(
        this.certificatesService,
      ),
    ),
  );
}
