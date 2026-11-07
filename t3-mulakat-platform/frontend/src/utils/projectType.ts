import type { ProjectType } from 'src/types';

export type AppBase = '' | '/admin' | '/hesap';

export function appBase(pathname = window.location.pathname): AppBase {
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return '/admin';
  if (pathname === '/hesap' || pathname.startsWith('/hesap/')) return '/hesap';
  return '';
}

export function appPath(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${appBase()}${normalized}`;
}

export function currentApp(): ProjectType {
  const base = appBase();
  if (base === '/admin') return 'admin_app';
  if (base === '/hesap') return 'accounts_app';
  return 'company_app';
}

export function isAdminApp() {
  return currentApp() === 'admin_app';
}

export function isAccountsApp() {
  return currentApp() === 'accounts_app';
}

export function isCompanyApp() {
  return currentApp() === 'company_app';
}
