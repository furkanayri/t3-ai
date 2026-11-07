import { Skeleton } from '@mui/material';
import type { ReactNode } from 'react';

export const Loader = ({ children, isLoading }: { children: ReactNode; isLoading: boolean }) => {
  if (isLoading) return <Skeleton>{children}</Skeleton>;

  return children;
};
