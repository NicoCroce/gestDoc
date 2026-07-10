import { protectedProcedure } from '@server/Infrastructure';
import { CertificatesServices } from '../../Application';
import { executeService, parseDateOnly } from '@server/Application';
import z from 'zod';

const filterParams = z.object({
  employee: z.string().optional(),
  date: z
    .union([z.string(), z.date()])
    .transform((arg) => parseDateOnly(arg))
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

  getCertificatesByCompany = protectedProcedure
    .input(filterParams.optional())
    .query(
      executeService(
        this.certificatesService.getCertificatesByCompany.bind(
          this.certificatesService,
        ),
      ),
    );

  getStatisticsByCertificates = protectedProcedure.query(
    executeService(
      this.certificatesService.getStatisticsByCertificates.bind(
        this.certificatesService,
      ),
    ),
  );

  getStatisticsByCertificatesMonthly = protectedProcedure.query(
    executeService(
      this.certificatesService.getMonthlyStatisticsByCertificates.bind(
        this.certificatesService,
      ),
    ),
  );
}
