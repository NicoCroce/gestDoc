import { LicensesListByUser } from './LicensesListByUser';
import { TuseGetCertificatesByCompany } from '@app/Domains/Admin/Hooks';

interface DocumentsListWrapperProps {
  service: TuseGetCertificatesByCompany;
}

export const LicensesListWrapper = ({ service }: DocumentsListWrapperProps) => {
  return (
    <LicensesListByUser service={service as TuseGetCertificatesByCompany} />
  );
};
