import { EmailOutlined } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { MailEdit01Icon } from "hugeicons-react";
import { useMemo } from "react";
import { useLocation } from "react-router";
import { useNewMail } from "src/providers";
import { isAccountsApp } from "src/utils";

export function FloatingEmailIcon() {
    const location = useLocation();

    const { openNewMail, isOpenNewMail } = useNewMail();

    const isAccounts = isAccountsApp()
    const isLoginPage = useMemo(() => {
        return ['/login', '/reset-password', '/forgot-password', '/register', '/create-account'].includes(
            location.pathname
        ) || location.pathname.includes('/reset-password/');
    }, [location.pathname]);

    return (
        isLoginPage || isAccounts ? null : (
            <div className="bg-white rounded-full p-[2px] fixed bottom-8 right-6 z-[1000]">
                <IconButton
                    sx={{
                        border: '1px solid',
                        borderColor: 'primary.main',
                        backgroundColor: 'background.paper',
                        visibility: isOpenNewMail ? 'hidden' : 'visible',
                        pointerEvents: isOpenNewMail ? 'none' : 'auto',
                        '&:hover': {
                            backgroundColor: 'primary.main',
                            color: 'background.paper',
                            transform: 'scale(1.1)',
                            transition: 'transform 0.5s ease',
                        },
                        p: 1.5
                    }}
                    color='primary'
                    onClick={() => openNewMail()}
                >
                    <MailEdit01Icon size={28} />
                </IconButton>
            </div>
        )
    );
}