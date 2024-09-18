import { List } from '@app/Aplication';
import { useGetDocuments } from '../Hooks/useGetDocuments';
import { Document } from './Document';

export const DocumentsList = () => {
  const { data } = useGetDocuments();

  if (!data) return null;

  return (
    <List>
      {data?.map((document) => (
        <List.Li key={document.id}>
          <Document {...document} />
        </List.Li>
      ))}
    </List>
  );
};
