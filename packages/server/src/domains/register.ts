import { container } from '@server/utils/Container';
import { userApp } from './Users';
import { authApp } from './Auth';
import { permissionsApp } from './Permissions';
import { documentsApp } from './Documents';
import { documentTypesApp } from './DocumentsTypes';

export const registerDomains = () =>
  container.register({
    ...authApp,
    ...userApp,
    ...permissionsApp,
    ...documentsApp,
    ...documentTypesApp,
  });
