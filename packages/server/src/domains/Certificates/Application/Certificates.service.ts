import {
  AppError,
  executeUseCase,
  IRequestContext,
  normalizeDate,
  uploadImages,
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
import { NextFunction, Request, Response } from 'express';

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

  savefilesMiddleware(req: Request, res: Response, next: NextFunction) {
    uploadImages(3).single('image')(req, res, next);
  }

  saveFiles(req: Request, res: Response) {
    const userId = 3;

    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ error: 'No se ha subido ningún archivo' });
      }

      console.log('Archivo recibido:', req.file);

      // Construir URL para acceder al archivo
      const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${userId}/${req.file.filename}`;

      return res.status(200).json({
        success: true,
        message: 'Imagen cargada correctamente',
        fileData: req.file,
        fileUrl,
      });
    } catch (error) {
      console.error('Error al procesar el archivo:', error);
      return res
        .status(500)
        .json({ error: 'Error al procesar la subida del archivo' });
    }
  }
}
