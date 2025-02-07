import { IRequestContext } from '@server/Application';
import { Certificate } from './Certificate.entity';

export interface IGetCertificatesRepository extends IRequestContext {}

export interface CertificateRepository {
  getCertificates({
    requestContext,
  }: IGetCertificatesRepository): Promise<Certificate[]>;
}
