import { IUseCase } from '@server/Application';
import { DocumentRepository } from '../Document.repository';
import {
  IGetStatisticsDocuments,
  IGetStatisticsDocumentsResponse,
} from '../Document.interfaces';

export class GetStatisticsDocuments
  implements IUseCase<IGetStatisticsDocumentsResponse>
{
  constructor(private readonly documentsRepository: DocumentRepository) {}

  execute({
    requestContext,
  }: IGetStatisticsDocuments): Promise<IGetStatisticsDocumentsResponse> {
    return this.documentsRepository.getStatisticsDocuments({
      requestContext,
    });
  }
}
