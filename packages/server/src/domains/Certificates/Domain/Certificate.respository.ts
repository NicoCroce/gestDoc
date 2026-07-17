import { IRequestContext } from '@server/Application';
import { Certificate } from './Certificate.entity';
import { CertificateTypes } from './CertificateTypes.entity';
import {
  ICertificate,
  IGetMonthlyStatisticsCertificatesResponse,
  IGetStatisticsCertificatesResponse,
  CertificateStatus,
} from './Certificate.types';

interface IFilters {
  filters?: {
    employee?: string;
    date?: Date;
    type?: number;
    year?: number;
    status?: CertificateStatus;
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

export type IGetStatisticsCertificatesRepository = IRequestContext;
export interface IGetMonthlyStatisticsCertificatesRepository extends IRequestContext {
  year?: number;
}

export interface IGetAllCompanyCertificatesRepository
  extends IRequestContext, IFilters {}

export interface IGetAllCompanyCertificatesRepositoryResponse extends ICertificate {
  userName: string;
}

export type IGetStatisticsCertificatesRepositoryResponse =
  IGetStatisticsCertificatesResponse;

export type IGetMonthlyStatisticsCertificatesRepositoryResponse =
  IGetMonthlyStatisticsCertificatesResponse;

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
  getMonthlyStatisticsCertificates({
    requestContext,
  }: IGetMonthlyStatisticsCertificatesRepository): Promise<IGetMonthlyStatisticsCertificatesRepositoryResponse>;
}
