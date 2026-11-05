import { createBrowserRouter } from 'react-router-dom';
import { isAdminApp, isAccountsApp, isCompanyApp } from 'src/utils';

import CompanyAppRoutes from './companyAppRoutes';
import AdminAppRoutes from './adminAppRoutes';
import AccountsAppRoutes from './accountsAppRoutes';

export const routes = createBrowserRouter(
  isCompanyApp()
    ? CompanyAppRoutes
    : isAdminApp()
    ? AdminAppRoutes
    : isAccountsApp()
    ? AccountsAppRoutes
    : []
);
