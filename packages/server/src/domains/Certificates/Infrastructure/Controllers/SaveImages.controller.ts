import { Express } from 'express';
import { CertificatesServices } from '../../Application';

export class SaveImagesController {
  constructor(
    private readonly app: Express,
    private readonly certificatesService: CertificatesServices,
  ) {
    this.appendImages();
  }

  appendImages = () => {
    return this.app.post(
      '/express/load',
      this.certificatesService.savefilesMiddleware,
      this.certificatesService.saveFiles,
    );
  };
}
