import { TDocumentRouter } from '@server/domains/Documents';
import { createTRPCReact } from '@trpc/react-query';

export const _documentsService = createTRPCReact<TDocumentRouter>();
export const documentsService = _documentsService.documents;
