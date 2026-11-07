import { ListItemText, MenuItem, Popover, Typography } from "@mui/material";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from 'react-hot-toast';

type Language = 'en' | 'tr';

type LanguageOptions = {
    [key in Language]: {
        icon: string;
        label: string;
    };
};

const languageOptions: LanguageOptions = {
    en: {
        icon: '/assets/flags/flag-uk.svg',
        label: 'EN',
    },
    tr: {
        icon: '/assets/flags/flag-tr.svg',
        label: 'TR',
    },

};

interface LanguagePopoverProps {
    anchorEl: null | Element;
    onClose?: () => void;
    open?: boolean;
}

export default function LanguagePopover(props: LanguagePopoverProps) {
    const { anchorEl, onClose, open = false, ...other } = props;
    const { i18n, t } = useTranslation();

    const handleChange = useCallback(
        async (language: Language): Promise<void> => {
            onClose?.();
            await i18n.changeLanguage(language);
            const message = t("languageChanged") as string;
            toast.success(message);
        },
        [onClose, i18n, t]
    );
    return (
        <Popover
            anchorEl={anchorEl}
            anchorOrigin={{
                horizontal: 'right',
                vertical: 'bottom',
            }}
            disableScrollLock
            transformOrigin={{
                horizontal: 'right',
                vertical: 'top',
            }}
            onClose={onClose}
            open={open}
            sx={{ width: 80 }}
        >
            {(Object.keys(languageOptions) as Language[]).map((language) => {
                const option = languageOptions[language];

                return (
                    <MenuItem
                        onClick={(event) => handleChange(language)}
                        key={language}
                        sx={{
                            color: '#6B7280',
                            '&:hover': {
                                backgroundColor: '#E31E24',
                                color: 'white',
                                fontWeight: 600,
                            },
                        }}
                    >
                        <ListItemText
                            primary={
                                <Typography
                                    sx={{
                                        textTransform: 'uppercase',
                                        fontSize: 14,
                                        fontWeight: 600,
                                        color: 'inherit',
                                    }}
                                >
                                    {option.label}
                                </Typography>
                            }
                        />
                    </MenuItem>
                );
            })}
        </Popover>
    )
}
