import { executeUseCase } from '@server/Application';
import { GetCertificates, IGetCertificates } from '../Domain';

export class CertificatesServices {
  constructor(private readonly _getCertificates: GetCertificates) {}

  getCertificates({ requestContext }: IGetCertificates) {
    return executeUseCase({ useCase: this._getCertificates, requestContext });
  }
}
