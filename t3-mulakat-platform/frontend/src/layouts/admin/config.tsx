import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Building05Icon, Configuration01Icon, UserSearch01Icon, Home01Icon, JobSearchIcon, UserGroupIcon, UserIcon, CollectionsBookmarkIcon, UserShield01Icon } from 'hugeicons-react';
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
  const { t, i18n } = useTranslation();

  return [
    {
      items: [
        {
          title: t('dashboard'),
          path: '/',
          icon: Home01Icon,
        },

        {
          title: t('jobPosts'),
          path: `/jobs`,
          icon: JobSearchIcon,
        },
        // {
        // title: t('postingChannels'),
        //   path: `/posting-channels`,
        //   icon: <PeopleIcon fontSize="small" />,
        // },
        {
          title: t('candidates'),
          path: '/candidates',
          icon: UserGroupIcon,
        },
        {
          title: t('applications'),
          path: '/applications',
          icon: UserSearch01Icon,
        },
        {
          title: t('tenants'),
          path: `/tenants`,
          icon: Building05Icon,
        },
        {
          title: t('categories'),
          path: '/categories',
          icon: CollectionsBookmarkIcon,
        },
        {
          title: t('systemMembers'),
          path: `/members`,
          icon: UserShield01Icon,
        },
        {
          title: t('users'),
          path: `/users`,
          icon: UserIcon,
        },
        {
          title: t('settings'),
          path: '/settings',
          icon: Configuration01Icon,
        },
      ],
    },
  ];
};
