import { certificatesController } from '../../certificates.di';

export const CertificatesRoutes = () => {
  const {
    getCertificates,
    getCertificateTypes,
    addCertificate,
    getCertificatesByCompany,
    getStatisticsByCertificates,
    getStatisticsByCertificatesMonthly,
  } = certificatesController();

  return {
    certificates: {
      getAll: getCertificates,
      getCertificateTypes,
      addCertificate,
      getCertificatesByCompany,
      getStatistics: getStatisticsByCertificates,
      getStatisticsMonthly: getStatisticsByCertificatesMonthly,
    },
  };
};
