import { AppError, IUseCase } from '@server/Application';
import {
  IGetDocumentsByCompany,
  IGetDocumentsByCompanyResponse,
} from '../Document.interfaces';
import { DocumentRepository } from '../Document.repository';
import { Document } from '../Document.entity';

export class GetDocumentsByCompany
  implements IUseCase<IGetDocumentsByCompanyResponse>
{
  constructor(private readonly documentsRepository: DocumentRepository) {}

  async execute({
    requestContext,
    input: filters,
  }: IGetDocumentsByCompany): Promise<IGetDocumentsByCompanyResponse> {
    const documents = await this.documentsRepository.getDocumentsByCompany({
      filters,
      requestContext,
    });

    if (!documents) {
      throw new AppError('Error al obtener los documentos');
    }

    const documentsByUser = documents.reduce(
      (
        res: { [userId: number]: { user: string; documents: Document[] } },
        doc,
      ) => {
        const userId = doc.values.user?.id;
        if (!userId) return res;

        if (!res[userId]) {
          res[userId] = {
            user: `${doc.values.user?.surname} ${doc.values.user?.name}`,
            documents: [],
          };
        }

        res[userId].documents.push(doc);

        return res;
      },
      {},
    );

    return documentsByUser;
  }
}
