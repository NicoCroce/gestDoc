import { Express } from 'express';
import { UserRoutes } from '@server/domains/Users';
import { router, trpcExpress, createContext } from '../trpc';
import { AuthRoutes } from '@server/domains/Auth';
import { PermissionsRoutes } from '@server/domains/Permissions';
import { DocumentsRoutes } from '@server/domains/Documents';
import { DocumentsTypesRoutes } from '@server/domains/DocumentsTypes';
import { CertificatesRoutes } from '@server/domains/Certificates/Infrastructure/Routes';
import { CertificatesRoutesExpress } from '@server/domains/Certificates/Infrastructure/Routes/CertificatesRoutesExpress';

const MainRouter = () => {
  const AllRouters = {
    ...UserRoutes(),
    ...AuthRoutes(),
    ...PermissionsRoutes(),
    ...DocumentsRoutes(),
    ...DocumentsTypesRoutes(),
    ...CertificatesRoutes(),
  };
  return router(AllRouters);
};

setTimeout(CertificatesRoutesExpress, 0);

const InstanceMainRouter = (app: Express) => {
  app.use(
    '/api',
    trpcExpress.createExpressMiddleware({
      router: MainRouter(),
      createContext,
    }),
  );
};

export type TMainRouter = ReturnType<typeof MainRouter>;
export { InstanceMainRouter };
