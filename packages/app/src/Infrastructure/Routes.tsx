import { AdminRouter } from '@app/Domains/Admin';
import { AuthRouter } from '@app/Domains/Auth';
import { CertificatesRouter } from '@app/Domains/Certificates';
import { DocumentsRouter } from '@app/Domains/Documents/';
import { UsersRouter } from '@app/Domains/Users';

export const AllRoutes = [
  AuthRouter,
  UsersRouter,
  DocumentsRouter,
  CertificatesRouter,
  AdminRouter,
];
