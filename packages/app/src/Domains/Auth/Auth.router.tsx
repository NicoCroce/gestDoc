import { Route } from 'react-router-dom';
import {
  LoginPage,
  RestorePasswordPage,
  ChangePasswordPublicPage,
} from './Pages';
import {
  AUTH_ROUTE,
  CHANGE_PASSWORD_PUBLIC,
  RESTORE_PASSWORD,
} from './Auth.routes';
import {} from './Pages';

export const AuthRouter = [
  <Route key="auth" path={AUTH_ROUTE} element={<LoginPage />} />,
  <Route
    key="restore-password"
    path={RESTORE_PASSWORD}
    element={<RestorePasswordPage />}
  />,
  <Route
    key="change-password"
    path={CHANGE_PASSWORD_PUBLIC}
    element={<ChangePasswordPublicPage />}
  />,
];
