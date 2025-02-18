import { createTRPCReact } from '@trpc/react-query';
import { TAuthRouter } from '@server/domains/Auth';
import { TCertificatesRouter } from '@server/domains/Certificates';

export const _authService = createTRPCReact<TAuthRouter>();
export const AuthService = _authService.auth;

export const _certificatesService = createTRPCReact<TCertificatesRouter>();
export const CertificatesService = _certificatesService.certificates;
