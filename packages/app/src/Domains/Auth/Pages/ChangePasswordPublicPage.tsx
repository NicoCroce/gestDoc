import { HalfPage, Title } from '@app/Aplication';
import { ChangePasswordFormPublic } from '../Components/ChangePasswordPublicForm';

export const ChangePasswordPublicPage = () => {
  return (
    <HalfPage title="Cambio de contraseña">
      <Title variant="h3">Ingresá tu contraseña nueva</Title>

      <ChangePasswordFormPublic />
    </HalfPage>
  );
};
