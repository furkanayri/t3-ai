import type { ReactNode } from 'react';

export interface Item {
  disabled?: boolean;
  external?: boolean;
  icon?: ReactNode;
  items?: Item[];
  label?: ReactNode;
  path?: string;
  title: string;
}

export interface Section {
  items: Item[];
  subheader?: string;
}

export const useSections = () => {
  // The candidate app is now a single-page portal (see CandidatePortal), so the
  // side navigation is intentionally empty and the SideNav is hidden for it.
  return [
    {
      items: [],
    },
  ];
};

