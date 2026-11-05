import React, { useState } from 'react';
import { SideNav, TopNav } from './components';
import { ReactNode } from 'react';

export function Layout({ children }: { children: ReactNode }) {
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

    return (
        <main>
            <section className='flex gap-8 relative'>
                <SideNav isOpen={isSidebarOpen} toggleOpen={toggleSidebar} />
                <div className='grow -mt-8 md:mt-0'>
                    <TopNav toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
                    {children}
                </div>
            </section>
        </main>
    );
}