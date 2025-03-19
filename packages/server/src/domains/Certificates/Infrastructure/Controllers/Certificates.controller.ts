import { protectedProcedure } from '@server/Infrastructure';
import { CertificatesServices } from '../../Application';
import { executeService } from '@server/Application';
import z from 'zod';

export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesServices) {}

  getCertificates = protectedProcedure.query(
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
