import { executeUseCase } from '@server/Application';
import {
  GetCertificates,
  GetCertificateTypes,
  IGetCertificates,
  IGetCertificateTypes,
} from '../Domain';

export class CertificatesServices {
  constructor(
    private readonly _getCertificates: GetCertificates,
    private readonly _getCertificateTypes: GetCertificateTypes,
  ) {}

  getCertificates({ requestContext }: IGetCertificates) {
    return executeUseCase({ useCase: this._getCertificates, requestContext });
  }

  getCertificateTypes({ requestContext }: IGetCertificateTypes) {
    return executeUseCase({
      useCase: this._getCertificateTypes,
      requestContext,
    });
  }
}
