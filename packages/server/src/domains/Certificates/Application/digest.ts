import { getDateString } from '@server/Application';
import { Certificate } from '../Domain';

export const convertToDTO = (certificate: Certificate) => {
  const { id, startDate, endDate, type, files, reason } = certificate.values;

  return {
    id: id!,
    startDate: getDateString(startDate),
    endDate: getDateString(endDate),
    files,
    reason,
    type: type.values.name!,
  };
};
