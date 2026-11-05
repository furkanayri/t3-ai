import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { RouterProvider } from 'react-router';
import { routes } from './routes';
import ErrorBoundary from './errorboundary';

const root = createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <HelmetProvider>
    <ErrorBoundary>
      <RouterProvider router={routes} />
    </ErrorBoundary>
  </HelmetProvider>
);
