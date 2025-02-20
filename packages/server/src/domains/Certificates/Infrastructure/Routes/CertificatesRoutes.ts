import { certificatesController } from '../../certificates.app';

export const CertificatesRoutes = () => {
  const { getCertificates, getCertificateTypes } = certificatesController();

  return {
    certificates: {
      getAll: getCertificates,
      getCertificateTypes,
    },
  };
};
