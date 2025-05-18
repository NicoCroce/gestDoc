import { userApp } from './Users';
import { authApp } from './Auth';
import { permissionsApp } from './Permissions';
import { documentsApp } from './Documents';
import { documentTypesApp } from './DocumentsTypes';
import { certificatesApp } from './Certificates';

export const registerDomains = () => ({
  ...authApp,
  ...userApp,
  ...permissionsApp,
  ...documentsApp,
  ...documentTypesApp,
  ...certificatesApp,
});
