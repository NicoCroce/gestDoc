import { router } from '@server/Infrastructure/trpc';
import { CertificatesRoutes } from './CertificatesRoutes';

const _CertificateRouter = () => router(CertificatesRoutes());
export type TCertificatesRouter = ReturnType<typeof _CertificateRouter>;
