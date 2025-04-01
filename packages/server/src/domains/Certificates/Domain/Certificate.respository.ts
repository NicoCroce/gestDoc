import { IRequestContext } from '@server/Application';
import { Certificate } from './Certificate.entity';
import { CertificateTypes } from './CertificateTypes.entity';
import {
  ICertificate,
  IGetStatisticsCertificatesResponse,
} from './Certificate.interfaces';

interface IFilters {
  filters?: {
    employee?: string;
    date?: Date;
    type?: number;
  };
}

export interface IGetCertificatesRepository extends IRequestContext, IFilters {}
export interface IAddCertificateRepository extends IRequestContext {
  certificate: Certificate;
}

export interface IAppendImagesRepository extends IRequestContext {
  certificateId: number;
  files: string[];
}

export interface IGetStatisticsCertificatesRepository extends IRequestContext {}

export interface IGetAllCompanyCertificatesRepository
  extends IRequestContext,
    IFilters {}

export interface IGetAllCompanyCertificatesRepositoryResponse
  extends ICertificate {
  userName: string;
}

export interface IGetStatisticsCertificatesRepositoryResponse
  extends IGetStatisticsCertificatesResponse {}

export interface CertificateRepository {
  getCertificates({
    filters,
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
  getAllCompanyCertificates({
    filters,
    requestContext,
  }: IGetAllCompanyCertificatesRepository): Promise<
    IGetAllCompanyCertificatesRepositoryResponse[]
  >;
  getStatisticsCertificates({
    requestContext,
  }: IGetStatisticsCertificatesRepository): Promise<IGetStatisticsCertificatesRepositoryResponse>;
}
