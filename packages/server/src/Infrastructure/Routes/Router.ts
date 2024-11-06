import { Express } from 'express';
import { UserRoutes } from '@server/domains/Users';
import { router, trpcExpress, createContext } from '../trpc';
import { AuthRoutes } from '@server/domains/Auth';
import { DocumentsRoutes } from '@server/domains/Documents/Infrastructure/Routes';
import { DocumentsTypesRoutes } from '@server/domains/DocumentsTypes/Infraestructure';

const MainRouter = () => {
  const AllRouters = {
    ...UserRoutes(),
    ...AuthRoutes(),
    ...DocumentsRoutes,
    ...DocumentsTypesRoutes,
  };
  return router(AllRouters);
};

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
