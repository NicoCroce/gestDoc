import { _certificatesService } from '../Certificates.service';

export const useCacheDocuments = () =>
  _certificatesService.useUtils().certificates.getAll;
