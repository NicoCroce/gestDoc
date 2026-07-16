import { getDateString } from '@server/Application';
import { Certificate } from '../Domain';

export const convertToDTO = (certificate: Certificate) => {
  const {
    id,
    startDate,
    endDate,
    returnDate,
    type,
    reason,
    requiresRest,
    files,
  } = certificate.values;

  return {
    id: id!,
    startDate: getDateString(startDate),
    endDate: getDateString(endDate),
    returnDate: getDateString(returnDate),
    reason,
    type: type.values.name || '',
    requiresRest,
    files,
  };
};
