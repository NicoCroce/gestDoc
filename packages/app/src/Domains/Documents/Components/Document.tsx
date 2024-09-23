import { Container, Title, Text } from '@app/Aplication';
import { Badge } from '@app/Aplication/Components/ui/badge';
import { Card } from '@app/Aplication/Components/ui/card';
import { TDocument } from '../Document.entity';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleCheck,
  faClockRotateLeft,
} from '@fortawesome/free-solid-svg-icons';

export const Document = ({
  title,
  requireSign,
  uploadDate,
  type,
  signed,
}: TDocument) => {
  return (
    <Card className="p-4 hover:cursor-pointer hover:shadow-lg transform-gpu hover:scale-95 transition-all duration-500">
      <Container space="small">
        <Container row justify="between">
          <Title variant="h4">{title}</Title>
          <FontAwesomeIcon
            className={`${signed ? 'text-green-800' : 'text-amber-600	'}`}
            icon={signed ? faCircleCheck : faClockRotateLeft}
          />
        </Container>
        <Text.Muted>
          {new Date(uploadDate).toLocaleDateString('es-AR')}
        </Text.Muted>
        <Container row justify="between">
          {requireSign ? <Badge>Requiere firma</Badge> : <span />}
          <Badge variant="secondary">{type}</Badge>
        </Container>
      </Container>
    </Card>
  );
};
