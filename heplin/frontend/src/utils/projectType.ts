import { PROJECT_TYPE } from 'src/constants';
import { ProjectType } from 'src/types';

export function isAdminApp() {
  return PROJECT_TYPE === 'admin_app';
}

export function isAccountsApp() {
  return PROJECT_TYPE === 'accounts_app';
}

export function isCompanyApp() {
  return PROJECT_TYPE === 'company_app';
}

export function currentApp(): ProjectType {
  return PROJECT_TYPE;
}
