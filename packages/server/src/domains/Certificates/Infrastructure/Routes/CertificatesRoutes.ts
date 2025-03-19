import { certificatesController } from '../../certificates.app';

export const CertificatesRoutes = () => {
  const {
    getCertificates,
    getCertificateTypes,
    addCertificate,
    getCertificatesByCompany,
  } = certificatesController();

  return {
    certificates: {
      getAll: getCertificates,
      getCertificateTypes,
      addCertificate,
      getCertificatesByCompany,
    },
  };
};
