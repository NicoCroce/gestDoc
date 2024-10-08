import { useURLParams } from '@app/Aplication';
import { TDocumentSearch } from '../Document.entity';

export const useGetFiltersSetted = () => {
  const { searchParams } = useURLParams<TDocumentSearch>();
  if (!searchParams) return false;

  return (
    searchParams &&
    Object.keys(searchParams).filter((key) => key !== 'state' && key !== 'id')
  )?.length > 0
    ? true
    : false;
};
