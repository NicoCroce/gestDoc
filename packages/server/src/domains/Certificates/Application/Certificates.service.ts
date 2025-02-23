import {
  AppError,
  executeUseCase,
  IRequestContext,
  normalizeDate,
} from '@server/Application';
import {
  AddCertificate,
  Certificate,
  GetCertificates,
  GetCertificateTypes,
  ICertificate,
  IGetCertificates,
  IGetCertificateTypes,
} from '../Domain';
import { CertificateDTO, IGetCertificatesDTO } from './DTO/CertificateDTO';
import { convertToDTO } from './digest';

interface IAddCertificateService extends IRequestContext {
  input: Omit<ICertificate, 'startDate' | 'endDate' | 'type'> & {
    startDate: string;
    endDate: string;
    type: number;
  };
}

export class CertificatesServices {
  constructor(
    private readonly _getCertificates: GetCertificates,
    private readonly _getCertificateTypes: GetCertificateTypes,
    private readonly _addCertificate: AddCertificate,
  ) {}

  async getCertificates({
    requestContext,
  }: IGetCertificates): Promise<IGetCertificatesDTO> {
    const certificates = await executeUseCase({
      useCase: this._getCertificates,
      requestContext,
    });

    // Convierte la respuesta del caso de uso en un objeto más simple.
    return Object.entries(certificates).reduce((response, [year, certs]) => {
      response[Number(year)] = certs.map((certificate: Certificate) =>
        convertToDTO(certificate),
      );

      return response;
    }, {} as IGetCertificatesDTO);
  }

  getCertificateTypes({ requestContext }: IGetCertificateTypes) {
    return executeUseCase({
      useCase: this._getCertificateTypes,
      requestContext,
    });
  }

  async addCertificate({
    input,
    requestContext,
  }: IAddCertificateService): Promise<CertificateDTO> {
    try {
      const _input = {
        ...input,
        startDate: normalizeDate(input.startDate),
        endDate: normalizeDate(input.endDate),
      };

      const certificate = await executeUseCase({
        useCase: this._addCertificate,
        input: _input,
        requestContext,
      });

      return convertToDTO(certificate);
    } catch {
      throw new AppError('Error en las fechas');
    }
  }
}
