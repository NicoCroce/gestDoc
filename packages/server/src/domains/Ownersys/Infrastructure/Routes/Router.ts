import { router } from '@server/Infrastructure/trpc';
import { OwnersysRoutes } from './Ownersys.routes';

const _OwnersysRouter = () => router(OwnersysRoutes());
export type TOwnersysRouter = ReturnType<typeof _OwnersysRouter>;
