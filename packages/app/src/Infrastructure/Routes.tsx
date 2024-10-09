import { AuthRouter } from '@app/Domains/Auth';
import { DocumentsRouter } from '@app/Domains/Documents/';
import { UsersRouter } from '@app/Domains/Users';

export const AllRoutes = [AuthRouter, UsersRouter, DocumentsRouter];
