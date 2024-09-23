import { Container, Title, Text, useURLParams } from '@app/Aplication';
import { Badge } from '@app/Aplication/Components/ui/badge';
import { Card } from '@app/Aplication/Components/ui/card';
import { TDocument, TDocumentSearch } from '../Document.entity';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleCheck,
  faClockRotateLeft,
} from '@fortawesome/free-solid-svg-icons';
import clsx from 'clsx';

export const Document = ({
  id,
  title,
  requireSign,
  uploadDate,
  type,
  signed,
}: TDocument) => {
  const { searchParams, updateParams } = useURLParams<TDocumentSearch>();

  const handleClick = () => {
    updateParams({ id });
  };

  const clasNameCard = clsx(
    'p-4 hover:cursor-pointer hover:shadow-lg transform-gpu transition-all duration-500',
    {
      'scale-95': id !== searchParams?.id, // Aplica scale-95 si el id no coincide
      'shadow-lg border-primary': id === searchParams?.id, // Agrega shadow-lg solo si coincide con el id
    },
  );

  return (
    <Card onClick={handleClick} className={clasNameCard}>
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
