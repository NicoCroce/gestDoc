import { Container } from '@app/Aplication/Components';
import { Certificate } from './Certificate/Certificate';
import { ICertificate } from '../Certificate.entity';

export interface CertificatesGridProps {
  certificatesList: ICertificate[];
}

export const CertificatesGrid = ({
  certificatesList,
}: CertificatesGridProps) => {
  return (
    <Container className="grid gap-2 grid-cols-[repeat(auto-fit,minmax(200px,420px))]">
      {certificatesList &&
        certificatesList.map((certificate) => (
          <div key={certificate.id}>
            <Certificate data={certificate} />
          </div>
        ))}
    </Container>
  );
};
