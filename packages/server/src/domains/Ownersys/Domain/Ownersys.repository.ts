import { IPaginationResponse, IRequestContext } from '@server/Application';
import { Ownersys } from './Ownersys.entity';

export interface IGetOwnersysRepository extends IRequestContext {
  id: number;
}
export interface IUpdateThemeRepository extends IRequestContext {
  tema: number;
}

export type IGetOwnerThemeRepository = IRequestContext;

export type IGetOwnersysRepositoryResponse = IPaginationResponse<Ownersys[]>;
export interface OwnersysRepository {
  updateTheme(params: IUpdateThemeRepository): Promise<number | null>;
  getOwnersys(params: IGetOwnersysRepository): Promise<Ownersys | null>;

  getOwnerTheme(params: IGetOwnerThemeRepository): Promise<number | null>;
}
