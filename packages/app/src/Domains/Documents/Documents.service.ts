import { TDocumentRouter } from '@server/domains/Documents';
import { TDocumentsTypeRouter } from '@server/domains/DocumentsTypes/Infraestructure';
import { createTRPCReact } from '@trpc/react-query';

export const _documentsService = createTRPCReact<TDocumentRouter>();
export const documentsService = _documentsService.documents;

export const _documentsTypesService = createTRPCReact<TDocumentsTypeRouter>();
export const documentsTypesService = _documentsTypesService.documentsType;
