import type { FC, ReactNode } from 'react';
import { useEffect } from 'react';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import stylisRTLPlugin from 'stylis-plugin-rtl';

type Direction = 'ltr' | 'rtl';

const styleCache = () =>
  createCache({
    key: 'rtl',
    prepend: true,
    // @ts-ignore
    stylisPlugins: [stylisRTLPlugin],
  });

interface RTLProps {
  children: ReactNode;
  direction?: Direction;
}

export const RTL: FC<RTLProps> = (props) => {
  const { children, direction = 'ltr' } = props;

  useEffect(() => {
    document.dir = direction;
  }, [direction]);

  if (direction === 'rtl') {
    return <CacheProvider value={styleCache()}>{children}</CacheProvider>;
  }

  return <>{children}</>;
};
