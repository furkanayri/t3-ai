import React, { useState } from 'react';
import { SideNav, TopNav } from './components';
import { ReactNode } from 'react';
import { isAccountsApp } from 'src/utils';

export function Layout({ children }: { children: ReactNode }) {
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

    // The candidate (accounts) app is a single-page portal, so it has no side
    // navigation; logout and language stay reachable through the TopNav.
    const showSideNav = !isAccountsApp();

    return (
        <main>
            <section className='flex gap-8 relative'>
                {showSideNav && <SideNav isOpen={isSidebarOpen} toggleOpen={toggleSidebar} />}
                <div className='grow -mt-8 md:mt-0'>
                    <TopNav toggleSidebar={toggleSidebar} isSidebarOpen={showSideNav ? isSidebarOpen : true} />
                    {children}
                </div>
            </section>
        </main>
    );
}