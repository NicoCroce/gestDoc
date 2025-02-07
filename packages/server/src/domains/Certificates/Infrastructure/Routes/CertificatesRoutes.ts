import { certificatesController } from '../../certificates.app';

export const CertificatesRoutes = () => {
  const { getCertificates } = certificatesController();

  return {
    certificates: {
      getAll: getCertificates,
    },
  };
};
