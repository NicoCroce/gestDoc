import { Container, Title, Text } from '@app/Aplication';
import { Badge } from '@app/Aplication/Components/ui/badge';
import { Card } from '@app/Aplication/Components/ui/card';
import { TDocument } from '../Document.entity';

export const Document = ({
  title,
  requireSign,
  uploadDate,
  type,
}: TDocument) => {
  return (
    <Card className="p-4 w-80">
      <Container>
        <Title variant="h3">{title}</Title>
        <Text.Muted>
          {new Date(uploadDate).toLocaleDateString('es-AR')}
        </Text.Muted>
        <Container row justify="between">
          <Badge>{requireSign ? 'Requiere firmar' : 'Firmado'}</Badge>
          <Badge variant="secondary">{type}</Badge>
        </Container>
      </Container>
    </Card>
  );
};
