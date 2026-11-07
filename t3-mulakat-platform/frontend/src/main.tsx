import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { RouterProvider } from 'react-router';
import { createAppRouter } from './routes';
import ErrorBoundary from './errorboundary';

const root = createRoot(document.getElementById('root') as HTMLElement);

createAppRouter().then((router) => {
  root.render(
    <HelmetProvider>
      <ErrorBoundary>
        <RouterProvider router={router} />
      </ErrorBoundary>
    </HelmetProvider>
  );
});
