import { asClass } from 'awilix';
import { CertificatesServices } from './Application';
import {
  AddCertificate,
  GetCertificates,
  GetCertificatesByCompany,
  GetCertificateTypes,
  AppendImages,
  GetMonthlyStatisticsCertificates,
  GetStatisticsCertificates,
} from './Application';
import {
  CertificatesController,
  SaveImagesController,
} from './Infrastructure/Controllers';
import { container } from '@server/Infrastructure/di/Container';
import { CertificatesRepositoryImplementation } from './Infrastructure/Databases';

export const certificatesApp = {
  certificatesRepository: asClass(CertificatesRepositoryImplementation),
  certificatesService: asClass(CertificatesServices),
  certificatesController: asClass(CertificatesController),
  saveImagesController: asClass(SaveImagesController),
  _getCertificates: asClass(GetCertificates),
  _getCertificateTypes: asClass(GetCertificateTypes),
  _addCertificate: asClass(AddCertificate),
  _appendImages: asClass(AppendImages),
  _getCertificatesByCompany: asClass(GetCertificatesByCompany),
  _getStatistisCertificates: asClass(GetStatisticsCertificates),
  _getMonthlyStatistisCertificates: asClass(GetMonthlyStatisticsCertificates),
};

export const certificatesController = () =>
  container.resolve<CertificatesController>('certificatesController');

export const saveImagesController = () =>
  container.resolve<SaveImagesController>('saveImagesController');
