import { IRequestContext } from '@server/Application';
import { Certificate } from './Certificate.entity';
import { CertificateTypes } from './CertificateTypes.entity';

export interface IGetCertificatesRepository extends IRequestContext {}

export interface CertificateRepository {
  getCertificates({
    requestContext,
  }: IGetCertificatesRepository): Promise<Certificate[]>;
  getCertificatesTypes({
    requestContext,
  }: IGetCertificatesRepository): Promise<CertificateTypes[]>;
}
