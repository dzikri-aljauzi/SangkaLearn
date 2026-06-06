import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import AutoRefreshIndicator from '@/Components/AutoRefreshIndicator';
import NotificationCenter from '@/Components/NotificationCenter';
import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { handleLogout } from '@/Utils/logout';
import { startAutoRefresh, stopAutoRefresh, restoreScrollPosition, REFRESH_CONFIGS } from '@/Utils/autoRefresh';
import { immediateRefreshWithMessage, restoreAfterRefresh, shouldSkipNormalRefresh } from '@/Utils/immediateRefresh';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const { url } = usePage();

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);
    const [refreshConfig, setRefreshConfig] = useState(REFRESH_CONFIGS.AUTHENTICATED_PAGES);
    const [showRefreshIndicator, setShowRefreshIndicator] = useState(false); // Hide by default for immediate refresh

    // Immediate refresh untuk authenticated pages (especially dashboard after login)
    useEffect(() => {
        console.log('🏠 Authenticated page loaded:', url);
        
        // Cek apakah ini setelah immediate refresh
        const wasImmediateRefresh = restoreAfterRefresh();
        
        // Determine if this is first load (especially dashboard after login)
        const isDashboard = url.includes('/dashboard') || url === '/dashboard';
        const isCourseDetail = url.includes('/courses/') && !url.includes('/admin/courses/');
        const isFirstLoad = !wasImmediateRefresh && !shouldSkipNormalRefresh();
        
        if (isFirstLoad && isDashboard && !isCourseDetail) {
            console.log('📊 First time entering dashboard after login - doing immediate refresh');
            immediateRefreshWithMessage('Masuk dashboard - refreshing untuk memastikan token fresh', 800);
            return;
        }
        
        if (wasImmediateRefresh) {
            console.log('✅ Authenticated page ready after immediate refresh');
            // Show refresh indicator setelah immediate refresh selesai
            setShowRefreshIndicator(true);
        }
        
        // Determine refresh config based on current page
        let config = REFRESH_CONFIGS.AUTHENTICATED_PAGES;
        
        if (isDashboard) {
            config = REFRESH_CONFIGS.DASHBOARD;
            console.log('📊 Dashboard - using dashboard config');
        }
        
        setRefreshConfig(config);
        
        // Start auto refresh only if not doing immediate refresh
        if (wasImmediateRefresh || !isFirstLoad) {
            startAutoRefresh(config);
            restoreScrollPosition();
        }
        
        // Cleanup saat component unmount
        return () => {
            stopAutoRefresh();
        };
    }, [url]);

    // Enhanced logout function dengan stop auto refresh
    const handleLogoutWithCleanup = () => {
        console.log('👋 Logging out - stopping auto refresh');
        stopAutoRefresh();
        handleLogout();
    };

    // Handle auto refresh events
    const handleRefresh = () => {
        console.log('🔄 Auto refresh triggered from indicator');
        window.location.reload();
    };

    const handleToggleRefresh = (enabled) => {
        console.log('🎛️ Auto refresh toggled:', enabled);
        if (enabled) {
            startAutoRefresh(refreshConfig);
        } else {
            stopAutoRefresh();
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="border-b border-gray-100 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link href="/" className="transition-all duration-300 hover:scale-105">
                                    <ApplicationLogo className="block h-12 sm:h-14 lg:h-16" width="180" height="56" />
                                </Link>
                            </div>

                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                <NavLink
                                    href={route('dashboard')}
                                    active={route().current('dashboard')}
                                >
                                    Dashboard
                                </NavLink>
                            </div>
                        </div>

                        <div className="hidden sm:ms-6 sm:flex sm:items-center space-x-4">
                            {/* Notification Center */}
                            <NotificationCenter />

                            <div className="relative">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none"
                                            >
                                                {user.name}

                                                <svg
                                                    className="-me-0.5 ms-2 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link
                                            href={route('profile.edit')}
                                        >
                                            Profile
                                        </Dropdown.Link>
                                        <button
                                            onClick={handleLogoutWithCleanup}
                                            className="block w-full px-4 py-2 text-start text-sm leading-5 text-gray-700 transition duration-150 ease-in-out hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                                        >
                                            Log Out
                                        </button>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' sm:hidden'
                    }
                >
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink
                            href={route('dashboard')}
                            active={route().current('dashboard')}
                        >
                            Dashboard
                        </ResponsiveNavLink>
                    </div>

                    <div className="border-t border-gray-200 pb-1 pt-4">
                        <div className="px-4">
                            <div className="text-base font-medium text-gray-800">
                                {user.name}
                            </div>
                            <div className="text-sm font-medium text-gray-500">
                                {user.email}
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>
                                Profile
                            </ResponsiveNavLink>
                            <button
                                onClick={handleLogoutWithCleanup}
                                className="block w-full px-4 py-2 text-start text-sm leading-5 text-gray-700 transition duration-150 ease-in-out hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                            >
                                Log Out
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white shadow">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>
            
            {/* Auto Refresh Indicator */}
            {showRefreshIndicator && (
                <AutoRefreshIndicator
                    interval={refreshConfig.interval}
                    enabled={refreshConfig.enabled}
                    onRefresh={handleRefresh}
                    onToggle={handleToggleRefresh}
                />
            )}
        </div>
    );
}
