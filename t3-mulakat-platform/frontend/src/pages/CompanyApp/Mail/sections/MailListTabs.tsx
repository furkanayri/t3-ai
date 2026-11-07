import { Divider, Tab, Tabs, Typography } from "@mui/material";
import { AlertSquareIcon, Archive02Icon, InboxIcon, SentIcon, UserIcon } from "hugeicons-react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

const SETTINGS_TABS = (t: any, mailAddress?: string) => [
  {
    label: <div className="text-left">
      <div>
        {t("Inbox")}
      </div>
      <Typography variant="caption" fontSize={12} color={"text.secondary"}>{mailAddress}</Typography>
    </div>,
    value: 'inbox',
    icon: InboxIcon
  },
  { label: t('Sent'), value: 'sent', icon: SentIcon },
  {
    type: "divider"
  },
  { label: t('allCandidates'), value: 'candidates', icon: UserIcon },
  { label: t("Non-Candidates"), value: "non-candidates", icon: Archive02Icon },
  { label: t("archived"), value: "archived", icon: AlertSquareIcon }
];

export default function MailListTabs({ mailAddress, handleClearRowSelection }: { mailAddress?: string, handleClearRowSelection: () => void; }) {
  const { t } = useTranslation();

  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get('activeTab') || 'inbox';

  return <Tabs
    orientation="vertical"
    variant="scrollable"
    value={activeTab}
    onChange={(e, value) => {
      setSearchParams((prev) => {
        if (value === 'inbox') prev.delete('activeTab');
        else
          prev.set('activeTab', value);
        if (value === "sent") prev.delete("status")

        return prev;
      })

      handleClearRowSelection()
    }
    }
    sx={{
      border: 1,
      borderColor: 'divider',
      width: 200,
      background: 'white',
      borderRadius: '8px',
      '& .Mui-selected': {
        color: '#E31E24 !important',
      },
      '& .MuiTabs-indicator': {
        backgroundColor: '#E31E24',
      },
    }}
  >
    {SETTINGS_TABS(t, mailAddress).map((setting, index) => {
      if (setting.type === "divider") return <Divider key={index} />

      const Icon = setting.icon as any;

      return (
        <Tab
          tabIndex={index}
          icon={<Icon fontSize="small" />}
          sx={{
            minHeight: '50px',
            marginLeft: '0 !important',
            paddingLeft: '24px',
            paddingBlock: '0px',
            display: 'flex',
            alignItems: 'center',
            columnGap: '16px',
            justifyContent: 'flex-start',
            flexDirection: 'row',
            fontSize: '14px',
            fontWeight: "500",
            fontFamily: "Satoshi, sans-serif",
            '> svg': {
              marginBottom: '0 !important',
            },
          }}
          label={setting.label}
          key={setting.value}
          value={setting.value}
        />
      );
    })}
  </Tabs>
}