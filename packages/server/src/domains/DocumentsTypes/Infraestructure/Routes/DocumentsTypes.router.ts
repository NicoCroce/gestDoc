import { router } from '@server/Infrastructure/trpc';
import { DocumentsTypesRoutes } from './DocumentsTypes.routes';

const DocumentsTypesRouter = router(DocumentsTypesRoutes);
export type TDocumentsTypeRouter = typeof DocumentsTypesRouter;
