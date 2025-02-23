import { certificatesController } from '../../certificates.app';

export const CertificatesRoutes = () => {
  const { getCertificates, getCertificateTypes, addCertificate } =
    certificatesController();

  return {
    certificates: {
      getAll: getCertificates,
      getCertificateTypes,
      addCertificate,
    },
  };
};
