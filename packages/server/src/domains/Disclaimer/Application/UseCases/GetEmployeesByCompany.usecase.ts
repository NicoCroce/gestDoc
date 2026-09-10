import { IUseCase, IPaginationResponse } from '@server/Application';
import { DisclaimerRepository, IEmployeeRecord } from '../../Domain';
import { IGetEmployeesByCompany } from '../disclaimer.types';
import { IsDisclaimerEnabled } from './IsDisclaimerEnabled.usecase';

export class GetEmployeesByCompany implements IUseCase<
  IPaginationResponse<IEmployeeRecord[]>,
  IGetEmployeesByCompanyInput
> {
  constructor(
    private readonly disclaimerRepository: DisclaimerRepository,
    private readonly isDisclaimerEnabled: IsDisclaimerEnabled,
  ) {}

  async execute({
    input,
    requestContext,
  }: IGetEmployeesByCompany): Promise<IPaginationResponse<IEmployeeRecord[]>> {
    const ownerId = input.ownerId ?? requestContext.values.ownerId;

    const enabled = await this.isDisclaimerEnabled.execute({
      input: ownerId,
      requestContext,
    });

    const response = await this.disclaimerRepository.getEmployeesByCompany({
      ownerId,
      search: input.search || '',
      page: input.page,
      limit: input.limit,
      withoutSegments: input.withoutSegments,
      segmentIds: input.segmentIds,
      requestContext,
    });

    if (!enabled) {
      return {
        ...response,
        data: response.data.map((employee) => ({
          ...employee,
          estado_firma: 'No aplica' as const,
        })),
      };
    }

    return response;
  }
}

export interface IGetEmployeesByCompanyInput {
  ownerId?: number;
  search?: string;
  page?: string;
  limit?: string;
  withoutSegments?: boolean;
  segmentIds?: number[];
}
