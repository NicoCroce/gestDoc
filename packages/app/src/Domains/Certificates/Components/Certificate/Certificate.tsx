import { Container, formatDate, Text } from '@app/Aplication';
import { ICertificate } from '../../Certificate.entity';

import './certificate.css';
import { Badge } from '@app/Aplication/Components/ui/badge';

interface CertificateProps {
  data: ICertificate;
}

export const Certificate = ({ data }: CertificateProps) => {
  const { startDate, endDate, reason, type, files } = data;

  return (
    <Container
      space="small"
      className="bg-gray-200 border border-gray-400 rounded-md p-4 certificate"
    >
      <Container className="mb-4">
        <Container row justify="between">
          <Badge className="uppercase">{type}</Badge>
          <Badge variant="secondary">
            <Container row>
              <span>{formatDate(startDate)}</span>
              <span>-</span>
              <span>{formatDate(endDate)}</span>
            </Container>
          </Badge>
        </Container>
        <Text.Small>{reason}</Text.Small>
      </Container>
      <Container>
        {files.map((file) => (
          <Container
            key={file}
            className="grid gap-2 grid-cols-[repeat(auto-fit,minmax(100px,1fr))]"
          >
            <button className="certificate">
              <img className="transition-all" src={file} />
            </button>
          </Container>
        ))}
      </Container>
    </Container>
  );
};
