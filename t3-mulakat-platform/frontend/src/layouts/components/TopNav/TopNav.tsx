import React from 'react';
import { Avatar, IconButton, Box, Button } from "@mui/material";
import { useAuth } from "src/providers";
import { convertPublicFileURL, isAccountsApp } from "src/utils";
import { AccountButton, LanguageSwitch } from "./sections";
import { NotificationsButton } from "../Notifications";
import MenuIcon from '@mui/icons-material/Menu';
import { Logout01Icon } from "hugeicons-react";
import { useTranslation } from "react-i18next";
import { RouterLink } from "src/components/router-link";

export default function TopNav({ toggleSidebar, isSidebarOpen }: { toggleSidebar: () => void, isSidebarOpen: boolean }) {
    const { activeTenant, user, logout } = useAuth();
    const { t } = useTranslation();

    return (
        isAccountsApp() ? (
            <div className='bg-[#E31E24] px-[55px] py-4 mb-[40px]'>
                <div className='relative flex justify-between items-center'>
                    <RouterLink href="/" className="shrink-0 flex items-center">
                        <img
                            src="/assets/t3-logo.png"
                            alt="Türkiye Teknoloji Takımı"
                            className="h-11 w-auto"
                            style={{ filter: 'brightness(0) invert(1)' }}
                        />
                    </RouterLink>
                    <p className="absolute left-1/2 -translate-x-1/2 text-white font-semibold text-lg whitespace-nowrap hidden md:block">
                        T3 Vakfı Mülakat Sistemi
                    </p>
                    <div className='flex items-center gap-3'>
                        <div className='flex flex-col leading-tight text-right text-white'>
                            <p className="font-medium">{user?.name} {user?.surname}</p>
                            {user?.email && (
                                <p className="text-xs text-white/80">{user?.email}</p>
                            )}
                        </div>
                        <LanguageSwitch color="#fff" />
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={logout}
                            startIcon={<Logout01Icon size={18} />}
                            sx={{
                                textTransform: 'none',
                                whiteSpace: 'nowrap',
                                color: '#fff',
                                borderColor: 'rgba(255,255,255,0.7)',
                                '&:hover': {
                                    borderColor: '#fff',
                                    backgroundColor: 'rgba(255,255,255,0.12)',
                                },
                            }}
                        >
                            {t('Logout')}
                        </Button>
                    </div>
                </div>
            </div>
        ) : (
            <div className='mt-12 pr-[55px] mb-[40px]'>
                <div className='flex justify-between items-center'>
                    <Box sx={{ width: '40px' }}>
                        {!isSidebarOpen && (
                            <IconButton onClick={toggleSidebar} sx={{ ml: -1 }}>
                                <MenuIcon style={{ color: '#E31E24' }} />
                            </IconButton>
                        )}
                    </Box>
                    <div className='flex items-center gap-2 ml-auto'>
                        <div className='flex items-center gap-[14px]'>
                            <Avatar
                                sx={{ width: 30, height: 30, textTransform: 'uppercase', backgroundColor: '#fff' }}
                                src={convertPublicFileURL(activeTenant?.logo)}
                                variant='rounded'
                            >
                                {activeTenant?.logo ? '' : activeTenant?.name?.charAt(0) + activeTenant?.name?.charAt(1)}
                            </Avatar>
                            <p className="font-medium text-gray-500">
                                {activeTenant?.name}
                            </p>
                        </div>
                        <LanguageSwitch />
                        {/* <NotificationsButton /> */}
                        <AccountButton />
                    </div>
                </div>
            </div>
        )
    );
}
