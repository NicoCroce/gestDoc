import { saveImagesController } from '../../certificates.app';

export const CertificatesRoutesExpress = () => {
  const { appendImages } = saveImagesController();

  appendImages();
};
