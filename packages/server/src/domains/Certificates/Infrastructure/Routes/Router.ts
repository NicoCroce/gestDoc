import { router } from '@server/Infrastructure/trpc';
import { CertificatesRoutes } from './CertificatesRoutes';

const CertificateRouter = () => router(CertificatesRoutes());
export type TCertificatesRouter = ReturnType<typeof CertificateRouter>;
