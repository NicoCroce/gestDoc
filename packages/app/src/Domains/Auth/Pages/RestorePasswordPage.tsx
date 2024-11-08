import { HalfPage, Title } from '@app/Aplication';
import { RestorePassword } from '../Components';
import { LeftContentPage } from '../Components/LeftContentPage';

const bg = '/images/password.jpg';

export const RestorePasswordPage = () => {
  return (
    <HalfPage
      title="Recuperación de contraseña"
      background={bg}
      left={<LeftContentPage />}
    >
      <Title variant="h3">
        Escribí el e-mail de tu cuenta y recibí las instrucciones para recuperar
        tu constraseña.
      </Title>

      <RestorePassword />
    </HalfPage>
  );
};
