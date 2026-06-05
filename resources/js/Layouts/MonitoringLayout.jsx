import React from 'react';
import { Head } from '@inertiajs/react';
import MonitoringSidebar from '@/Components/MonitoringSidebar';
import MonitoringNavbar from '@/Components/MonitoringNavbar';

export default function MonitoringLayout({ 
    children, 
    title = 'Content Monitoring',
    showSidebar = true 
}) {
    return (
        <div className="min-h-screen bg-gray-50">
            <Head title={title} />
            
            {/* Top Navigation for Monitoring */}
            <MonitoringNavbar />

            <div className="flex">
                {/* Monitoring Sidebar */}
                {showSidebar && <MonitoringSidebar />}

                {/* Main Content */}
                <div className="flex-1">
                    <main className="min-h-screen pt-0">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}