import { Express, Request, Response } from 'express';
import { CertificatesServices } from '../../Application';
import { authMiddleware } from '@server/Infrastructure/Auth/Auth';
import { IAppendImages } from '../../Domain';

export class SaveImagesController {
  constructor(
    private readonly app: Express,
    private readonly certificatesService: CertificatesServices,
  ) {
    this.appendImages();
  }

  appendImages = () =>
    this.app.post(
      '/express/load',
      authMiddleware,
      this.certificatesService.savefilesMiddleware,
      async (req: Request, res: Response) => {
        const input: IAppendImages['input'] = {
          file: req.file,
          host: req.get('host')!,
          protocol: req.protocol,
        };

        try {
          const response = await this.certificatesService.saveFiles({
            input,
            requestContext: req.requestContext,
          });

          res.send(response);
        } catch (error) {
          res.status(500).send(error);
        }
      },
    );
}
