import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { LicenseDraftIcon, MeetingRoomIcon, UserIcon, Analytics01Icon, Mic01Icon, ClipboardIcon } from 'hugeicons-react';

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
  const { t } = useTranslation();

  return [
    {
      items: [
        // {
        //   title: t('My Applications'),
        //   path: `/my-applications`,
        //   icon: LicenseDraftIcon,
        // },
        {
          title: t('Account'),
          path: `/account`,
          icon: UserIcon,
        },
        // {
        //   title: t('Meetings'),
        //   path: `/meetings`,
        //   icon: MeetingRoomIcon,
        // },
        // {
        //   title: t('Personality Test'),
        //   path: `/personal-test`,
        //   icon: Analytics01Icon,
        // },
        {
          title: t('PersonalityTest.title'),
          path: `/inventory-test`,
          icon: Analytics01Icon,
        },
        {
          title: t('interviews'),
          path: `/interviews`,
          icon: Mic01Icon,
        },
        // {
        //   title: t('Quiz'),
        //   path: `/quizzes`,
        //   icon: ClipboardIcon,
        // }
      ],
    },
  ];
};

