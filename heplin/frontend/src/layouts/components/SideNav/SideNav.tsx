import React from 'react';
import { RouterLink } from "src/components/router-link";
// Logo bileşenleri yerine T3 logosu görselini doğrudan kullanıyoruz
import { isAccountsApp, isAdminApp, isCompanyApp } from "src/utils";
import { useSections as useAccountsSections } from '../../accounts/config';
import { useSections as useAdminSections } from '../../admin/config';
import { useSections as useCompanySections } from '../../dashboard/config';
import { useAuth } from "src/providers";
import { Logout02Icon, RectangularIcon } from "hugeicons-react";
import { useTranslation } from "react-i18next";
import cn from 'classnames';
import { usePathname } from "src/hooks/use-pathname";
import { Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import { ReactNode } from "react";

export interface Item {
    disabled?: boolean;
    external?: boolean;
    icon?: (props: any) => JSX.Element;
    items?: Item[];
    label?: ReactNode;
    path?: string;
    title: string;
}

export interface Section {
    items: Item[];
    subheader?: string;
}

export default function SideNav({ isOpen, toggleOpen }: { isOpen: boolean; toggleOpen: () => void }) {
    const { logout, activeTenant, user } = useAuth();
    const { t } = useTranslation();
    const pathname = usePathname();
    const sections =
        isAdminApp() ? useAdminSections() :
            isCompanyApp() ? useCompanySections() :
                isAccountsApp() ? useAccountsSections() :
                    [];
    const link = isCompanyApp() ? `/${activeTenant?.subdomain}` : "/";

    return (
        <div className="relative">
            <nav
                className={`fixed top-0 left-0 min-h-screen h-full p-6 flex flex-col z-50 transition-all duration-500 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} w-[280px]`}
                style={{
                    background: 'linear-gradient(135deg, #eee -10%, #ef4444 25%, #dc2626 50%, #ef4444 75%, #eee 130%)',
                    backdropFilter: 'blur(20px)',
                    borderRight: '1px solid rgba(255, 255, 255, 0.15)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                    overflow: 'hidden'
                }}
            >
                {/* Dekoratif gradient overlay */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-white/10 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>

                {/* Animasyonlu arka plan deseni */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute -top-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
                </div>

                <div className="absolute top-4 right-4 z-50">
                    <Button
                        onClick={toggleOpen}
                        sx={{
                            borderRadius: '12px',
                            minWidth: 'auto',
                            width: '40px',
                            height: '40px',
                            padding: 0,
                            background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            color: '#dc2626',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #E31E24 0%, #dc2626 100%)',
                                color: '#ffffff',
                                transform: 'scale(1.05)',
                                boxShadow: '0 8px 25px rgba(227, 30, 36, 0.3)',
                                border: '1px solid transparent',
                            },
                        }}
                    >
                        <CloseIcon sx={{ fontSize: '18px' }} />
                    </Button>
                </div>

                <div className="pt-12 pb-4 relative z-10">
                    <RouterLink href={link}>
                        <div className='w-full h-max flex items-center justify-center'>
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                                <div className="relative bg-gradient-to-br from-white/90 to-white/80 p-4 rounded-xl shadow-lg border border-white/30 hover:shadow-xl hover:border-white/50 transition-all duration-300 backdrop-blur-sm">
                                    <img src="/assets/t3-logo.png" alt="T3" className="max-w-[160px] h-auto transition-transform duration-300 group-hover:scale-105" />
                                </div>
                            </div>
                        </div>
                    </RouterLink>
                </div>
                <div className='flex-1 overflow-y-auto relative z-10'>
                    {sections?.map((section, index) => (
                        <NavSection key={index} section={section as Section} pathname={pathname} />
                    ))}
                </div>
                <div
                    className='group relative mt-6 p-4 rounded-2xl cursor-pointer transition-all duration-300 bg-gradient-to-r from-white/10 to-white/20 border border-white/20 hover:from-white/20 hover:to-white/30 hover:border-white/30 hover:shadow-lg z-10 animate-shimmer'
                    style={{
                        backgroundImage: 'linear-gradient(110deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 100%)'
                    }}
                    onClick={logout}
                >
                    <div className='relative flex items-center gap-3'>
                        <div className='flex items-center justify-center w-10 h-10 bg-gradient-to-br from-white/80 to-white rounded-xl text-red-600 group-hover:from-white group-hover:to-white group-hover:scale-110 transition-all duration-300 shadow-lg shadow-white/20'>
                            <Logout02Icon size={20} />
                        </div>
                        <div className="flex-1">
                            <p className="text-base font-bold text-white group-hover:text-white transition-colors duration-300">{t('Logout')}</p>
                            <p className="text-sm text-white/80 group-hover:text-white transition-colors duration-300">Hesaptan çıkış yap</p>
                        </div>
                    </div>
                </div>
            </nav>
            <div
                className={`transition-all duration-500 ${isOpen ? 'ml-[280px] w-[calc(100%-280px)]' : 'ml-0 w-full'}`}
            >

            </div>
        </div>
    );
}

function NavSection({ section, pathname }: { section: Section, pathname?: string }) {
    const { activeTenant } = useAuth();
    const companySlug = activeTenant?.subdomain;

    return (
        <div className='mb-8'>
            {section.subheader && (
                <div className="mb-4 px-3">
                    <p className="text-sm font-bold text-white uppercase tracking-wider">{section.subheader}</p>
                    <div className="mt-2 h-px bg-gradient-to-r from-white/30 via-white/20 to-transparent"></div>
                </div>
            )}
            <div className='space-y-2'>
                {section.items.map((item, index) => {
                    const checkPath = !!(item.path && pathname);
                    let isActive = false;

                    if (checkPath) {
                        // Ana sayfa için tam eşleşme kontrolü
                        if (item.path === `/${companySlug}` || item.path === '/') {
                            isActive = pathname === item.path;
                        }
                        // Diğer sayfalar için alt sayfa kontrolü de yapılır
                        else {
                            isActive = pathname === item.path || pathname?.startsWith(item.path + '/');
                        }
                    }

                    const Icon = item?.icon ?? RectangularIcon;
                    return (
                        <RouterLink key={index + item.title} href={item?.disabled ? "#" : (item?.path ?? "#")} target={item?.external ? "_blank" : "_self"} style={{ pointerEvents: item?.disabled ? 'none' : 'auto' }}>
                            <div
                                className={cn(
                                    "group relative flex items-center gap-3 h-14 px-4 rounded-xl transition-all duration-300 border",
                                    {
                                        'bg-gradient-to-r from-white/20 to-white/10 text-white shadow-lg shadow-white/10 border-white/20 backdrop-blur-sm': isActive,
                                        'text-white hover:bg-white/10 hover:shadow-sm border-transparent hover:border-white/20': !isActive && !item?.disabled,
                                        'opacity-50 cursor-not-allowed': item?.disabled,
                                        'cursor-pointer': !item?.disabled
                                    }
                                )}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-2 bottom-2 w-1 bg-white rounded-r-full"></div>
                                )}
                                <div className={cn(
                                    "flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300",
                                    {
                                        'bg-white/20 text-white': isActive,
                                        'bg-white/20 text-white group-hover:bg-white/30': !isActive
                                    }
                                )}>
                                    <Icon size={20} stroke={isActive ? "#fff" : "currentColor"} />
                                </div>
                                <p className="font-semibold text-base text-white group-hover:translate-x-1 transition-transform duration-300">{item.title}</p>
                                {!isActive && (
                                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                    </div>
                                )}
                            </div>
                        </RouterLink>
                    );
                })}
            </div>
        </div>
    );
}
