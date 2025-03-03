import { container } from '@server/utils/Container';
import { userApp } from './Users';
import { authApp } from './Auth';
import { permissionsApp } from './Permissions';
import { documentsApp } from './Documents';
import { documentTypesApp } from './DocumentsTypes';
import { certificatesApp } from './Certificates';
import { asValue } from 'awilix';
import { Express } from 'express';

export const registerDomains = (app: Express) =>
  container.register({
    app: asValue(app),
    ...authApp,
    ...userApp,
    ...permissionsApp,
    ...documentsApp,
    ...documentTypesApp,
    ...certificatesApp,
  });
