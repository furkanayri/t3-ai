import React from 'react';
import { Avatar, IconButton, Box } from "@mui/material";
import { useAuth } from "src/providers";
import { convertPublicFileURL, isAccountsApp } from "src/utils";
import { AccountButton, LanguageSwitch } from "./sections";
import { NotificationsButton } from "../Notifications";
import MenuIcon from '@mui/icons-material/Menu';

export default function TopNav({ toggleSidebar, isSidebarOpen }: { toggleSidebar: () => void, isSidebarOpen: boolean }) {
    const { activeTenant, user } = useAuth();

    return (
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
                        {isAccountsApp() ? (
                            <p className="font-medium">{user?.name} {user?.surname}</p>
                        ) : (
                            <>
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
                            </>
                        )}
                    </div>
                    <LanguageSwitch />
                    {/* <NotificationsButton /> */}
                    <AccountButton />
                </div>
            </div>
        </div>
    );
}
