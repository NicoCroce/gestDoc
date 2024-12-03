import { HalfPage } from '@app/Aplication';
import { LoginForm } from '../Components';
import { useLogout } from '../Hooks/useLogout';
import { LeftContentPage } from '../Components/LeftContentPage';

const bg = '/images/login.jpg';

export const LoginPage = () => {
  useLogout();

  return (
    <HalfPage title="Iniciar sesión" left={<LeftContentPage />} background={bg}>
      <LoginForm />
    </HalfPage>
  );
};
