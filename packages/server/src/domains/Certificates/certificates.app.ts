import { asClass } from 'awilix';
import { CertificatesServices } from './Application';
import { AddCertificate, GetCertificates, GetCertificateTypes } from './Domain';
import { CertificatesController } from './Infrastructure/Controllers';
import { container } from '@server/utils/Container';
import { CertificatesRepositoryImplementation } from './Infrastructure/Databases';

export const certificatesApp = {
  certificatesRepository: asClass(CertificatesRepositoryImplementation),
  certificatesService: asClass(CertificatesServices),
  certificatesController: asClass(CertificatesController),
  _getCertificates: asClass(GetCertificates),
  _getCertificateTypes: asClass(GetCertificateTypes),
  _addCertificate: asClass(AddCertificate),
};

export const certificatesController = () =>
  container.resolve<CertificatesController>('certificatesController');
