import { router } from '@server/Infrastructure/trpc';
import { DocumentsRoutes } from './DocumentsRoutes';

const DocumentRouter = () => router(DocumentsRoutes());
export type TDocumentRouter = ReturnType<typeof DocumentRouter>;
