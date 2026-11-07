import { Avatar, Box, Button, Divider, ListItemButton, ListItemIcon, ListItemText, Popover, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useAuth } from "src/providers";
import { useParams } from "react-router";
import { UserSharingIcon, Logout01Icon, Settings02Icon } from "hugeicons-react";
import { RouterLink } from "src/components/router-link";
import { convertPublicFileURL } from "src/utils";

interface AccountPopoverProps {
    anchorEl: null | Element;
    onClose?: () => void;
    open?: boolean;
}

export default function AccountPopover(props: AccountPopoverProps) {
    const { t } = useTranslation();
    const { anchorEl, onClose, open, ...other } = props;
    const { logout, user } = useAuth();
    const { companySlug } = useParams()

    return (
        <Popover
            anchorEl={anchorEl}
            anchorOrigin={{
                horizontal: 'center',
                vertical: 'bottom',
            }}
            disableScrollLock
            onClose={onClose}
            open={!!open}
            slotProps={{
                paper: {
                    sx: {
                        width: 260,
                        borderRadius: 1.5,
                        boxShadow: 3,
                        overflow: 'hidden'
                    }
                }
            }}
        >
            {/* Header with Avatar */}
            <Box
                sx={{
                    p: 3,
                    backgroundColor: 'background.paper',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    borderBottom: 1,
                    borderColor: 'divider'
                }}
            >
                <Avatar
                    sx={{
                        height: 64,
                        width: 64,
                        mb: 2,
                        background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                        color: 'white',
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        border: '3px solid',
                        borderColor: 'background.paper',
                        '& .MuiAvatar-img': {
                            border: '3px solid',
                            borderColor: 'background.paper',
                            borderRadius: '50%'
                        }
                    }}
                    src={convertPublicFileURL(user?.avatar)}
                >
                    {user?.name?.[0]}
                    {user?.surname?.[0]}
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, color: 'text.primary' }}>
                    {user?.name} {user?.surname}
                </Typography>
                <Typography
                    variant="body2"
                    color="text.secondary"
                >
                    {user?.email}
                </Typography>
            </Box>

            {/* Menu Items */}
            <Box sx={{ py: 1 }}>
                <ListItemButton
                    component={RouterLink}
                    href={companySlug ? `/${companySlug}/account` : `/account`}
                    onClick={onClose}
                    sx={{
                        mx: 1,
                        borderRadius: 1.5,
                        px: 2,
                        py: 1.5,
                        '&:hover': {
                            backgroundColor: 'action.hover',
                        },
                        transition: 'all 0.2s ease'
                    }}
                >
                    <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}>
                        <UserSharingIcon size={20} />
                    </ListItemIcon>
                    <ListItemText
                        primary={
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {t('profile')}
                            </Typography>
                        }
                    />
                </ListItemButton>

                {/* <ListItemButton
                    component={RouterLink}
                    href={companySlug ? `/${companySlug}/settings` : `/settings`}
                    onClick={onClose}
                    sx={{
                        mx: 1,
                        borderRadius: 1.5,
                        px: 2,
                        py: 1.5,
                        '&:hover': {
                            backgroundColor: 'action.hover',
                        },
                        transition: 'all 0.2s ease'
                    }}
                >
                    <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>
                        <Settings02Icon size={20} />
                    </ListItemIcon>
                    <ListItemText
                        primary={
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {t('settings')}
                            </Typography>
                        }
                    />
                </ListItemButton> */}
            </Box>

            <Divider sx={{ my: 1 }} />

            {/* Logout Button */}
            <Box sx={{ p: 2 }}>
                <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    onClick={logout}
                    startIcon={<Logout01Icon size={18} />}
                    sx={{
                        py: 1,
                        borderRadius: 1,
                        textTransform: 'none',
                        fontWeight: 500,
                        borderColor: 'error.main',
                        color: 'error.main',
                        '&:hover': {
                            backgroundColor: 'error.alpha8',
                            borderColor: 'error.dark'
                        },
                        transition: 'all 0.2s ease'
                    }}
                >
                    {t('Logout')}
                </Button>
            </Box>
        </Popover>
    )
}
