import { certificatesController } from '../../certificates.app';

export const CertificatesRoutes = () => {
  const {
    getCertificates,
    getCertificateTypes,
    addCertificate,
    getCertificatesByCompany,
    getStatisticsByCertificates,
  } = certificatesController();

  return {
    certificates: {
      getAll: getCertificates,
      getCertificateTypes,
      addCertificate,
      getCertificatesByCompany,
      getStatistics: getStatisticsByCertificates,
    },
  };
};
