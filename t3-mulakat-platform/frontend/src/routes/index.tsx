import { createBrowserRouter } from 'react-router-dom';
import { appBase } from 'src/utils';

export async function createAppRouter() {
  const base = appBase();

  if (base === '/admin') {
    const { default: adminRoutes } = await import('./adminAppRoutes');
    return createBrowserRouter(adminRoutes, { basename: '/admin' });
  }

  if (base === '/hesap') {
    const { default: accountRoutes } = await import('./accountsAppRoutes');
    return createBrowserRouter(accountRoutes, { basename: '/hesap' });
  }

  const { default: companyRoutes } = await import('./companyAppRoutes');
  return createBrowserRouter(companyRoutes);
}
