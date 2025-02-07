import { protectedProcedure } from '@server/Infrastructure';
import { CertificatesServices } from '../../Application';
import { executeService } from '@server/Application';

export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesServices) {}

  getCertificates = protectedProcedure.query(
    executeService(
      this.certificatesService.getCertificates.bind(this.certificatesService),
    ),
  );
}
