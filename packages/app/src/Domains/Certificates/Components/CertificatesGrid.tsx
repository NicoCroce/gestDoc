import { Container } from '@app/Application/Components';
import { Certificate } from './Certificate/Certificate';
import { ICertificate } from '../Certificate.entity';

export interface CertificatesGridProps {
  certificatesList: ICertificate[];
}

export const CertificatesGrid = ({
  certificatesList,
}: CertificatesGridProps) => {
  return (
    <Container className="grid gap-2 grid-cols-[repeat(auto-fit,minmax(300px,1fr))]">
      {certificatesList &&
        certificatesList.map((certificate) => (
          <div key={certificate.id} className="min-w-0 h-full">
            <Certificate data={certificate} />
          </div>
        ))}
    </Container>
  );
};
