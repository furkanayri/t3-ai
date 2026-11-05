import { Button, Tooltip } from "@mui/material";
import { useTranslation } from "react-i18next";
import { usePopover } from "src/hooks/use-popover";
import LanguagePopover from './LanguagePopover';

type Language = 'en' | 'tr';

const languages: Record<Language, string> = {
    en: '/assets/flags/flag-uk.svg',
    tr: '/assets/flags/flag-tr.svg'
};

export default function LanguageSwitch() {
    const { i18n, t } = useTranslation();
    const popover = usePopover<HTMLButtonElement>();

    return (
        <>
            <Tooltip title={t('languages')}>
                <Button
                    onClick={popover.handleOpen}
                    ref={popover.anchorRef}
                    sx={{ textTransform: 'uppercase', color: '#E31E24', fontWeight: 600 }}
                >
                    {i18n.language}
                </Button>
            </Tooltip>
            <LanguagePopover
                anchorEl={popover.anchorRef.current}
                onClose={popover.handleClose}
                open={popover.open}
            />
        </>
    )
}
