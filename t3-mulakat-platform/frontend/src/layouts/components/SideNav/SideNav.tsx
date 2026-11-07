import React from 'react';
import { RouterLink } from "src/components/router-link";
import { isAccountsApp, isAdminApp, isCompanyApp } from "src/utils";
import { useSections as useAccountsSections } from '../../accounts/config';
import { useSections as useAdminSections } from '../../admin/config';
import { useSections as useCompanySections } from '../../dashboard/config';
import { useAuth } from "src/providers";
import { Logout02Icon, RectangularIcon } from "hugeicons-react";
import { useTranslation } from "react-i18next";
import cn from 'classnames';
import { usePathname } from "src/hooks/use-pathname";
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
    const { logout, activeTenant } = useAuth();
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
                className={`fixed top-0 left-0 z-50 flex h-full min-h-screen w-[280px] flex-col border-r border-neutral-200 bg-white p-5 shadow-[4px_0_24px_rgba(15,23,42,0.04)] transition-all duration-500 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="flex items-center justify-between gap-3 pb-5">
                    <RouterLink href={link} className="min-w-0">
                        <img src="/assets/t3-logo.png" alt="T3" className="h-auto max-w-[148px]" />
                    </RouterLink>
                    <button
                        type="button"
                        onClick={toggleOpen}
                        aria-label="Menüyü kapat"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
                    >
                        <CloseIcon sx={{ fontSize: 18 }} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {sections?.map((section, index) => (
                        <NavSection key={index} section={section as Section} pathname={pathname} />
                    ))}
                </div>

                <div className="mt-4 border-t border-neutral-100 pt-4">
                    <div
                        className="group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-red-50"
                        onClick={logout}
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-[#E31E24] transition-colors group-hover:bg-white">
                            <Logout02Icon size={18} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-neutral-800">{t('Logout')}</p>
                            <p className="text-xs text-neutral-400">Hesaptan çıkış yap</p>
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
        <div className="mb-6">
            {section.subheader && (
                <div className="mb-3 px-3">
                    <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">{section.subheader}</p>
                    <div className="mt-2 h-px bg-neutral-200"></div>
                </div>
            )}
            <div className="space-y-1">
                {section.items.map((item, index) => {
                    const checkPath = !!(item.path && pathname);
                    let isActive = false;

                    if (checkPath) {
                        if (item.path === `/${companySlug}` || item.path === '/') {
                            isActive = pathname === item.path;
                        }
                        else {
                            isActive = pathname === item.path || pathname?.startsWith(item.path + '/');
                        }
                    }

                    const Icon = item?.icon ?? RectangularIcon;
                    return (
                        <RouterLink key={index + item.title} href={item?.disabled ? "#" : (item?.path ?? "#")} target={item?.external ? "_blank" : "_self"} style={{ pointerEvents: item?.disabled ? 'none' : 'auto' }}>
                            <div
                                className={cn(
                                    "group relative flex h-11 items-center gap-3 rounded-xl px-3 transition-colors duration-200",
                                    {
                                        'bg-red-50 text-[#E31E24]': isActive,
                                        'text-neutral-600 hover:bg-neutral-50': !isActive && !item?.disabled,
                                        'cursor-not-allowed opacity-50': item?.disabled,
                                        'cursor-pointer': !item?.disabled
                                    }
                                )}
                            >
                                {isActive && (
                                    <div className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-[#E31E24]"></div>
                                )}
                                <div className={cn(
                                    "flex h-9 w-9 items-center justify-center rounded-lg transition-colors duration-200",
                                    {
                                        'bg-[#E31E24]/10 text-[#E31E24]': isActive,
                                        'bg-neutral-100 text-neutral-500 group-hover:bg-neutral-200/70': !isActive
                                    }
                                )}>
                                    <Icon size={18} stroke={isActive ? "#E31E24" : "currentColor"} />
                                </div>
                                <p className={cn("text-sm font-medium", { 'font-semibold': isActive })}>{item.title}</p>
                            </div>
                        </RouterLink>
                    );
                })}
            </div>
        </div>
    );
}
