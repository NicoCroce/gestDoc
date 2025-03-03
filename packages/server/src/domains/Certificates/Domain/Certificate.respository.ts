import { IRequestContext } from '@server/Application';
import { Certificate } from './Certificate.entity';
import { CertificateTypes } from './CertificateTypes.entity';

export interface IGetCertificatesRepository extends IRequestContext {}
export interface IAddCertificateRepository extends IRequestContext {
  certificate: Certificate;
}

export interface IAppendImagesRepository extends IRequestContext {
  certificateId: number;
  files: string[];
}
export interface CertificateRepository {
  getCertificates({
    requestContext,
  }: IGetCertificatesRepository): Promise<Certificate[]>;
  getCertificatesTypes({
    requestContext,
  }: IGetCertificatesRepository): Promise<CertificateTypes[]>;
  addCertificate({
    requestContext,
    certificate,
  }: IAddCertificateRepository): Promise<Certificate>;
  appendImages({
    requestContext,
    certificateId,
    files,
  }: IAppendImagesRepository): Promise<Certificate>;
}
