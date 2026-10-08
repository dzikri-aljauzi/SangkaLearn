import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { BarChart3, Settings, LogOut } from 'lucide-react';

export default function MonitoringNavbar() {
    const { auth, notifications = [] } = usePage().props;
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    const userRole = auth.user?.roles?.[0]?.name;

    return (
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Left side - Logo */}
                    <div className="flex items-center space-x-3">
                        <Link href="/" className="flex items-center flex-shrink-0 transition-all duration-300 hover:scale-105">
                            <ApplicationLogo 
                                className="h-12 sm:h-16 lg:h-20 w-auto" 
                                width="200" 
                                height="64" 
                            />
                        </Link>
                        <div className="ml-4 flex items-center">
                            <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
                            <h1 className="text-lg font-bold text-gray-900">Monitoring Dashboard</h1>
                        </div>
                    </div>

                    {/* Right side - User profile */}
                    <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                        {/* Profile Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                className="flex items-center space-x-2 p-1 sm:p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                {auth.user?.avatar ? (
                                    <img
                                        src={auth.user.avatar.startsWith('http') ? auth.user.avatar : `/storage/${auth.user.avatar}`}
                                        alt={auth.user.first_name}
                                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-gray-200"
                                    />
                                ) : (
                                    <div className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm border-2 border-gray-200">
                                        {auth.user?.first_name?.charAt(0)}{auth.user?.last_name?.charAt(0)}
                                    </div>
                                )}
                                <span className="hidden lg:block text-sm font-medium text-gray-700 max-w-24 truncate">
                                    {auth.user?.first_name}
                                </span>
                            </button>

                            {/* Profile Dropdown */}
                            {isProfileMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                    <div className="px-4 py-2 border-b border-gray-100">
                                        <p className="text-sm font-medium text-gray-900">
                                            {auth.user?.first_name} {auth.user?.last_name}
                                        </p>
                                        <p className="text-xs text-gray-500">{auth.user?.email}</p>
                                        {userRole && (
                                            <span className="inline-block mt-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full capitalize">
                                                {userRole}
                                            </span>
                                        )}
                                    </div>

                                    <Link
                                        href="/profile/settings"
                                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        onClick={() => setIsProfileMenuOpen(false)}
                                    >
                                        <Settings className="w-4 h-4" />
                                        <span>Profile Settings</span>
                                    </Link>

                                    <Link
                                        href={route('admin.dashboard')}
                                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        onClick={() => setIsProfileMenuOpen(false)}
                                    >
                                        <BarChart3 className="w-4 h-4" />
                                        <span>Back to Dashboard</span>
                                    </Link>

                                    <Link
                                        href="/logout"
                                        method="post"
                                        className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                        onClick={() => setIsProfileMenuOpen(false)}
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span>Sign out</span>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Click outside to close menu */}
            {isProfileMenuOpen && (
                <div 
                    className="fixed inset-0 z-30 bg-black bg-opacity-25" 
                    onClick={() => setIsProfileMenuOpen(false)}
                />
            )}
        </header>
    );
}