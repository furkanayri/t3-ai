import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { tokens } from 'src/locales/tokens';
import { useParams } from 'react-router';
import { Configuration01Icon, Home01Icon, JobSearchIcon, Mail02Icon, MeetingRoomIcon, UserGroupIcon, UserMultiple02Icon, FolderUploadIcon } from 'hugeicons-react'; // FolderUploadIcon'u ekledik

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
  const { companySlug } = useParams();

  return useMemo(() => {
    return [
      {
        items: [
          {
            title: t(tokens.nav.overview),
            path: `/${companySlug}`,
            icon: Home01Icon,
          },
          {
            title: t(tokens.jobs.list),
            path: `/${companySlug}/jobs`,
            icon: JobSearchIcon,
            disabled: true,
          },
          {
            title: t(tokens.candidates.index),
            path: `/${companySlug}/candidates`,
            icon: UserGroupIcon,
          },
          {
            title: t(tokens.meetings.index),
            path: `/${companySlug}/meetings`,
            icon: MeetingRoomIcon,
            disabled: true,
          },

          {
            title: t('teams'),
            path: `/${companySlug}/teams`,
            icon: UserMultiple02Icon,
            disabled: true,
          },
          {
            title: t("Mailbox"),
            path: `/${companySlug}/mail`,
            icon: Mail02Icon,
            disabled: true,
          },
          {
            title: t('TopluCv'),
            path: `/${companySlug}/bulk-cv-upload`,
            icon: FolderUploadIcon,
            disabled: true,
          },
          // {
          //   title: t('inventoryTesting'),
          //   path: `/${companySlug}/inventory-testing`,
          //   icon: FolderUploadIcon,
          // },
          {
            title: t('settings'),
            path: '?settings=open',
            icon: Configuration01Icon,
          },

        ],
      },
    ];
  }, [t, companySlug]);
};
