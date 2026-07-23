import { IUseCase } from '@server/Application';
import { DisclaimerRepository, IEmployeeRecord } from '../../Domain';
import { IGetEmployeesByCompany } from '../disclaimer.types';

export class GetEmployeesByCompany implements IUseCase<
  IEmployeeRecord[],
  IGetEmployeesByCompanyInput
> {
  constructor(private readonly disclaimerRepository: DisclaimerRepository) {}

  async execute({
    input,
    requestContext,
  }: IGetEmployeesByCompany): Promise<IEmployeeRecord[]> {
    const ownerId = input.ownerId ?? requestContext.values.ownerId;

    return this.disclaimerRepository.getEmployeesByCompany({
      ownerId,
      search: input.search || '',
      requestContext,
    });
  }
}

export interface IGetEmployeesByCompanyInput {
  ownerId?: number;
  search?: string;
}
