import { Avatar, Box, ButtonBase } from "@mui/material";
import { usePopover } from "src/hooks/use-popover";
import { useAuth } from "src/providers";
import { convertPublicFileURL } from "src/utils";
import AccountPopover from "./AccountPopover";

export default function AccountButton() {
    const { user } = useAuth();
    const popover = usePopover<HTMLButtonElement>();

    return (
        <>
            <Box
                component={ButtonBase}
                onClick={popover.handleOpen}
                ref={popover.anchorRef}
                sx={{
                    alignItems: 'center',
                    display: 'flex',
                    height: 44,
                    width: 44,
                    borderRadius: '50%',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        transform: 'scale(1.05)',
                        '&::before': {
                            opacity: 1,
                        }
                    },
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        inset: -3,
                        borderRadius: '50%',
                        background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
                        padding: '2px',
                        opacity: 0,
                        transition: 'opacity 0.2s ease',
                        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        WebkitMaskComposite: 'xor',
                        maskComposite: 'exclude',
                    }
                }}
            >
                <Avatar
                    sx={{
                        height: 40,
                        width: 40,
                        textTransform: 'uppercase',
                        background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                        color: 'white',
                        fontSize: '1rem',
                        fontWeight: 700,
                        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
                        '& img': {
                            objectFit: 'cover',
                        }
                    }}
                    src={convertPublicFileURL(user?.avatar)}
                >
                    {user?.name?.[0]}
                    {user?.surname?.[0]}
                </Avatar>

                {/* Online Status Indicator */}
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: 'success.main',
                        border: '2px solid',
                        borderColor: 'background.paper',
                    }}
                />
            </Box>
            <AccountPopover
                anchorEl={popover.anchorRef.current}
                onClose={popover.handleClose}
                open={popover.open}
            />
        </>
    )
}
