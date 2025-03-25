import { Container, Text } from '@app/Aplication';
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
      className="border border-gray-200 shadow-lg rounded-md p-4 certificate"
    >
      <Container className="mb-4">
        <Container row justify="between">
          <Badge className="uppercase">{type}</Badge>
          <Badge variant="secondary">
            <Container row space="none">
              <span className="max-w-[90px] text-ellipsis overflow-hidden whitespace-nowrap">
                {startDate}
              </span>
              <span className="px-1">-</span>
              <span className="max-w-[90px] text-ellipsis overflow-hidden whitespace-nowrap">
                {endDate}
              </span>
            </Container>
          </Badge>
        </Container>
        <Text.Small>{reason}</Text.Small>
      </Container>
      <Container
        className="grid grid-cols-[repeat(auto-fit,minmax(50px,1fr))] overflow-hidden max-h-20"
        space="small"
      >
        {files?.map((file) => (
          <Container key={file}>
            <button className="certificate">
              <img className="transition-all" src={file} />
            </button>
          </Container>
        ))}
      </Container>
    </Container>
  );
};
