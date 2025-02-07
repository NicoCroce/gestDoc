import { Container } from '@app/Aplication/Components';
import { Certificate } from './Certificate';

export const CertificatesGrid = () => {
  return (
    <Container className="grid gap-2 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
      {Array(20)
        .fill(0)
        .map(() => (
          <div>
            <Certificate />
          </div>
        ))}
    </Container>
  );
};
