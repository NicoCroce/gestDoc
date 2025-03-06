import { AppError, IUseCase } from '@server/Application';
import {
  IAppendImages,
  IAppendImagesResponse,
} from '../Certificate.interfaces';

export class AppendImages implements IUseCase<IAppendImagesResponse> {
  async execute({
    input: { file, host, protocol },
    requestContext,
  }: IAppendImages): Promise<IAppendImagesResponse> {
    const userId = requestContext.values.userId;

    try {
      if (!file) throw new AppError('No se ha subido ningún archivo', 400);

      console.log('Archivo recibido:', file);

      // Construir URL para acceder al archivo
      const fileUrl = `${protocol}://${host}/uploads/${userId}/${file.filename}`;

      return {
        message: 'Imagen cargada correctamente',
        fileData: file,
        fileUrl,
      };
    } catch (error) {
      console.error('Error al procesar el archivo:', error);
      throw new AppError('Error al procesar la subida del archivo');
    }
  }
}
