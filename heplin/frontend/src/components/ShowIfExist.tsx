import { ReactNode } from 'react';

export default function ShowIfExist({
  children,
  render,
}: {
  children?: ReactNode;
  render?: (children: ReactNode) => ReactNode;
}) {
  if (!children) return null;
  return render ? render(children) : children;
}
