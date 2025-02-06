import { asClass } from 'awilix';
import { CertificatesServices } from './Application';
import { GetCertificates } from './Domain';
import { CertificatesController } from './Infrastructure/Controllers';
import { container } from '@server/utils/Container';
import { CertificatesRepositoryImplementation } from './Infrastructure/Databases';

export const certificatesApp = {
  certificatesRepository: asClass(CertificatesRepositoryImplementation),
  certificatesService: asClass(CertificatesServices),
  certificatesController: asClass(CertificatesController),
  _getCertificates: asClass(GetCertificates),
};

export const certificatesController = () =>
  container.resolve<CertificatesController>('certificatesController');
