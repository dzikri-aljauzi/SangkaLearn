import React, { useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Toaster } from 'react-hot-toast';
import NotificationCenter from '../Components/NotificationCenter';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { useCartCount } from '../Hooks/useCartCount';
import {
    BookOpen,
    Menu,
    X,
    Bell,
    User,
    Settings,
    LogOut,
    Home,
    GraduationCap,
    ShoppingCart,
    ShoppingBag,
    MessageSquare,
    Award,
    BarChart3,
    Users,
    FileText,
    UserCheck,
    History,
    Database,
    PlayCircle,
    ChevronDown,
    ChevronRight,
    UserPlus,
    GraduationCapIcon,
    HelpCircle,
    Briefcase,
    Globe
} from 'lucide-react';

export default function AppLayout({ children, title = 'LMS Platform', showSidebar = true, hideHeader = false }) {
    const { auth, notifications = [] } = usePage().props;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [expandedMenus, setExpandedMenus] = useState({});
    const { cartCount } = useCartCount();

    // Get current route from Inertia
    const currentRoute = route().current();
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    const userRole = auth.user?.roles?.[0]?.name;

    // Different navigation based on user role
    const getNavigation = () => {
        if (userRole === 'admin') {
            return [
                { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
                {
                    name: 'Pengguna',
                    icon: Users,
                    submenu: [
                        { name: 'Instruktur', href: '/admin/users/instructors', icon: GraduationCap },
                        { name: 'Siswa', href: '/admin/users/students', icon: User },
                        { name: 'Sub Admin', href: '/admin/sub-admins', icon: UserCheck }
                    ]
                },
                { name: 'Pelatihan', href: '/admin/courses', icon: BookOpen },
                { name: 'Monitoring', href: '/admin/monitoring', icon: BarChart3 },
                { name: 'Pesan', href: '/admin/messages', icon: MessageSquare },
                { name: 'Laporan', href: '/admin/reports', icon: FileText },
                { name: 'Riwayat Pendaftaran', href: '/admin/enrollments', icon: UserCheck },
                { name: 'Sertifikat', href: '/admin/certificates', icon: Award },
                { name: 'Grup Management', href: '/admin/groups', icon: Users },
                {
                    name: 'Halaman Depan',
                    icon: Globe,
                    submenu: [
                        { name: 'Kelola Alumni', href: '/admin/alumni', icon: GraduationCap },
                        { name: 'Kelola Lowongan', href: '/admin/job-information', icon: Briefcase }
                    ]
                },
                {
                    name: 'Pengaturan',
                    icon: Settings,
                    submenu: [
                        { name: 'Pengaturan Pembayaran', href: '/admin/settings/payment', icon: Settings },
                        { name: 'Pengaturan SMTP', href: '/admin/settings/smtp', icon: Settings },
                        { name: 'Pengaturan Sosial Media', href: '/admin/settings/social', icon: Settings }
                    ]
                },
            ];
        } else if (userRole === 'instructor') {
            return [
                { name: 'Dashboard', href: '/instructor/dashboard', icon: Home },
                { name: 'My Courses', href: '/instructor/courses', icon: BookOpen },
                { name: 'Students', href: '/instructor/students', icon: Users },
                { name: 'Messages', href: '/instructor/messages', icon: MessageSquare },
                { name: 'Analytics', href: '/instructor/analytics', icon: BarChart3 },
            ];
        } else if (userRole === 'sub_admin') {
            return [
                { name: 'Dashboard', href: '/subadmin/dashboard', icon: Home },
                { name: 'My Students', href: '/subadmin/students', icon: Users },
                { name: 'Progress Tracking', href: '/subadmin/progress', icon: BarChart3 },
            ];
        } else {
            return [
                { name: 'Dashboard', href: '/student/dashboard', icon: Home },
                { name: 'My Learning', href: '/student/my-learning', icon: GraduationCap },
                { name: 'Browse Courses', href: '/student/browse-courses', icon: BookOpen },
                { name: 'Messages', href: '/student/messages', icon: MessageSquare },
                { name: 'Progress', href: '/student/progress', icon: BarChart3 },
                { name: 'Certificates', href: '/student/certificates', icon: Award },
                { name: 'Purchase History', href: '/student/purchase-history', icon: ShoppingBag },
            ];
        }
    };

    const navigation = getNavigation();

    const toggleSubmenu = (menuName) => {
        setExpandedMenus(prev => ({
            ...prev,
            [menuName]: !prev[menuName]
        }));
    };

    // Check if a menu item is active
    const isMenuActive = (item) => {
        if (!item.href) return false;
        
        // Exact match first
        if (currentPath === item.href || currentRoute === item.routeName) {
            return true;
        }
        
        // Special handling for different user roles
        if (userRole === 'sub_admin') {
            // Sub admin specific route matching - use startsWith for flexibility
            if (currentPath.startsWith('/subadmin/dashboard') && item.name === 'Dashboard') {
                return currentPath === '/subadmin/dashboard';
            }
            if (currentPath.startsWith('/subadmin/students') && item.name === 'My Students') {
                return true;
            }
            if (currentPath.startsWith('/subadmin/progress') && item.name === 'Progress Tracking') {
                return true;
            }
            return false;
        } else if (userRole === 'admin') {
            // Admin specific route matching
            return currentPath.startsWith(item.href);
        } else if (userRole === 'instructor') {
            // Instructor specific route matching
            return currentPath.startsWith(item.href);
        } else {
            // Student specific route matching
            return currentPath.startsWith(item.href);
        }
    };

    // Check if any submenu item is active (to auto-expand parent)
    const hasActiveSubmenu = (submenu) => {
        if (!submenu) return false;
        return submenu.some(subItem => 
            currentPath === subItem.href || 
            currentRoute === subItem.routeName ||
            currentPath.startsWith(subItem.href)
        );
    };

    // Auto-expand parent menu if submenu is active
    useEffect(() => {
        const navigation = getNavigation();
        const newExpandedMenus = {};
        
        navigation.forEach(item => {
            if (item.submenu && hasActiveSubmenu(item.submenu)) {
                newExpandedMenus[item.name] = true;
            }
        });
        
        if (Object.keys(newExpandedMenus).length > 0) {
            setExpandedMenus(prev => ({ ...prev, ...newExpandedMenus }));
        }
    }, [currentPath, currentRoute]);

    return (
        <>
            <Head title={title} />

            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                {!hideHeader && (
                <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
                    <div className="px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            {/* Left side - Logo always at the far left */}
                            <div className="flex items-center space-x-3">
                                {showSidebar && (
                                    <button
                                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                        className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                    >
                                        {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                                    </button>
                                )}
                                
                                <Link href="/" className="flex items-center flex-shrink-0 transition-all duration-300 hover:scale-105">
                                    <ApplicationLogo 
                                        className="h-12 sm:h-16 lg:h-20 w-auto" 
                                        width="200" 
                                        height="64" 
                                    />
                                </Link>
                            </div>


                            {/* Right side - Always at the far right */}
                            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                                {/* Cart (only for students) */}
                                {userRole === 'student' && (
                                    <Link
                                        href="/cart"
                                        className="p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 relative transition-colors"
                                        title="Keranjang Belanja"
                                    >
                                        <ShoppingCart className="w-5 h-5" />
                                        {cartCount > 0 && (
                                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                                {cartCount > 99 ? '99+' : cartCount}
                                            </span>
                                        )}
                                    </Link>
                                )}

                                {/* Notifications */}
                                <div className="hidden sm:block">
                                    <NotificationCenter />
                                </div>

                                {/* Profile Menu - Always visible */}
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
                                            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm border-2 border-gray-200">
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
                                            
                                            {/* Notifications link for mobile */}
                                            <div className="sm:hidden">
                                                <Link
                                                    href="/notifications"
                                                    className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    onClick={() => setIsProfileMenuOpen(false)}
                                                >
                                                    <div className="flex items-center space-x-2">
                                                        <Bell className="w-4 h-4" />
                                                        <span>Notifications</span>
                                                    </div>
                                                    {notifications.length > 0 && (
                                                        <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                                            {notifications.length}
                                                        </span>
                                                    )}
                                                </Link>
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
                                                href="/logout"
                                                method="post"
                                                className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                                onClick={() => {
                                                    setIsProfileMenuOpen(false);
                                                    // Clear any immediate refresh flags before logout
                                                    sessionStorage.removeItem('isImmediateRefresh');
                                                    sessionStorage.removeItem('refreshMessage');
                                                    sessionStorage.removeItem('scrollPosition');
                                                }}
                                                onSuccess={() => {
                                                    // Force CSRF token refresh after logout
                                                    if (window.refreshCSRFToken) {
                                                        window.refreshCSRFToken().catch(() => {});
                                                    }
                                                }}
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

                    {/* Mobile menu */}
                    {isMobileMenuOpen && showSidebar && (
                        <div className="lg:hidden bg-white border-t border-gray-200">
                            <div className="px-4 py-2 space-y-1">
                                {navigation.map((item) => {
                                    const Icon = item.icon;
                                    const hasSubmenu = item.submenu && item.submenu.length > 0;
                                    const isActive = !hasSubmenu && isMenuActive(item);
                                    const hasActiveChild = hasActiveSubmenu(item.submenu);

                                    // For items with submenu, render submenu items directly
                                    if (hasSubmenu) {
                                        return (
                                            <div key={item.name} className="space-y-1">
                                                <div className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium ${
                                                    hasActiveChild
                                                        ? 'text-blue-700 bg-blue-50'
                                                        : 'text-gray-500'
                                                }`}>
                                                    <Icon className={`w-5 h-5 ${hasActiveChild ? 'text-blue-600' : 'text-gray-400'}`} />
                                                    <span>{item.name}</span>
                                                </div>
                                                <div className="ml-8 space-y-1">
                                                    {item.submenu.map((subItem) => {
                                                        const SubIcon = subItem.icon;
                                                        const isSubActive = currentPath === subItem.href ||
                                                                          currentPath.startsWith(subItem.href);
                                                        return (
                                                            <Link
                                                                key={subItem.name}
                                                                href={subItem.href}
                                                                className={`relative flex items-center space-x-3 px-3 py-2 rounded-lg transition-all ${
                                                                    isSubActive
                                                                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                                                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                                                }`}
                                                                onClick={() => setIsMobileMenuOpen(false)}
                                                            >
                                                                {isSubActive && (
                                                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-yellow-400 rounded-r-full" />
                                                                )}
                                                                <SubIcon className={`w-4 h-4 ${isSubActive ? 'text-white' : ''}`} />
                                                                <span className={`text-sm ${isSubActive ? 'font-semibold' : ''}`}>{subItem.name}</span>
                                                                {isSubActive && (
                                                                    <span className="ml-auto w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                                                                )}
                                                            </Link>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    }

                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={`relative flex items-center space-x-3 px-3 py-2 rounded-lg transition-all ${
                                                isActive
                                                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                            }`}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            {isActive && (
                                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-yellow-400 rounded-r-full" />
                                            )}
                                            <Icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
                                            <span className={isActive ? 'font-semibold' : ''}>{item.name}</span>
                                            {isActive && (
                                                <span className="ml-auto w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </header>
                )}

                <div className="flex w-full">
                    {/* Sidebar Navigation (Desktop) - Only show if showSidebar is true */}
                    {showSidebar && (
                        <div className="hidden lg:flex lg:flex-shrink-0">
                            <div className="flex flex-col w-64 fixed h-screen z-30">
                                <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                    <nav className="mt-5 flex-1 px-4 space-y-1">
                                        {navigation.map((item) => {
                                            const Icon = item.icon;
                                            const isActive = isMenuActive(item);
                                            const hasSubmenu = item.submenu && item.submenu.length > 0;
                                            const isExpanded = expandedMenus[item.name];
                                            const hasActiveChild = hasActiveSubmenu(item.submenu);
                                            const shouldHighlightParent = hasActiveChild || isExpanded;
                                            
                                            return (
                                                <div key={item.name} className="relative">
                                                    {hasSubmenu ? (
                                                        <button
                                                            onClick={() => toggleSubmenu(item.name)}
                                                            className={`group flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 relative ${
                                                                shouldHighlightParent
                                                                    ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 shadow-sm'
                                                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                                            }`}
                                                        >
                                                            {/* Active indicator for parent menu */}
                                                            {hasActiveChild && (
                                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-full"></div>
                                                            )}
                                                            
                                                            <div className="flex items-center">
                                                                <Icon className={`mr-3 h-5 w-5 transition-colors duration-200 ${
                                                                    shouldHighlightParent ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                                                                }`} />
                                                                <span className="font-medium">{item.name}</span>
                                                            </div>
                                                            <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                                                                <ChevronRight className={`h-4 w-4 ${shouldHighlightParent ? 'text-blue-500' : 'text-gray-400'}`} />
                                                            </div>
                                                        </button>
                                                    ) : (
                                                        <Link
                                                            href={item.href}
                                                            className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 relative ${
                                                                isActive
                                                                    ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 shadow-sm'
                                                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                                            }`}
                                                        >
                                                            {/* Active indicator */}
                                                            {isActive && (
                                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-full"></div>
                                                            )}
                                                            
                                                            <Icon className={`mr-3 h-5 w-5 transition-colors duration-200 ${
                                                                isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                                                            }`} />
                                                            <span className="font-medium">{item.name}</span>
                                                        </Link>
                                                    )}
                                                    
                                                    {/* Submenu with improved styling */}
                                                    {hasSubmenu && isExpanded && (
                                                        <div className="ml-6 mt-1 space-y-1 border-l-2 border-gray-100 pl-3">
                                                            {item.submenu.map((subItem) => {
                                                                const SubIcon = subItem.icon;
                                                                const isSubActive = currentPath === subItem.href || 
                                                                                  currentPath.startsWith(subItem.href) ||
                                                                                  currentRoute === subItem.routeName;
                                                                
                                                                return (
                                                                    <Link
                                                                        key={subItem.name}
                                                                        href={subItem.href}
                                                                        className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 relative ${
                                                                            isSubActive
                                                                                ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 shadow-sm border-l-2 border-blue-600'
                                                                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:border-l-2 hover:border-gray-300'
                                                                        }`}
                                                                    >
                                                                        <SubIcon className={`mr-3 h-4 w-4 transition-colors duration-200 ${
                                                                            isSubActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                                                                        }`} />
                                                                        <span className={isSubActive ? 'font-semibold' : 'font-medium'}>
                                                                            {subItem.name}
                                                                        </span>
                                                                        
                                                                        {/* Active dot indicator */}
                                                                        {isSubActive && (
                                                                            <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
                                                                        )}
                                                                    </Link>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </nav>

                                    {/* Role-specific sidebar content */}
                                    {userRole === 'student' && (
                                        <div className="mx-4 mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                                            <h4 className="text-sm font-medium text-gray-900 mb-2">Learning Progress</h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs text-gray-600">
                                                    <span>This Month</span>
                                                    <span>12/20 hours</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style={{width: '60%'}}></div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Main Content */}
                    <div className={`flex flex-col flex-1 min-w-0 w-full overflow-x-hidden ${showSidebar ? 'lg:ml-64' : ''}`}>
                        <main className="flex-1">
                            {children}
                        </main>
                    </div>
                </div>

                {/* Click outside to close menus */}
                {(isMobileMenuOpen || isProfileMenuOpen) && (
                    <div 
                        className="fixed inset-0 z-30 bg-black bg-opacity-25" 
                        onClick={() => {
                            setIsMobileMenuOpen(false);
                            setIsProfileMenuOpen(false);
                        }}
                    />
                )}
            </div>
            
            {/* Toast Notifications */}
            <Toaster
                position="top-right"
                reverseOrder={false}
                gutter={8}
                containerClassName=""
                containerStyle={{}}
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#ffffff',
                        color: '#374151',
                        borderRadius: '12px',
                        padding: '16px 20px',
                        fontSize: '14px',
                        fontWeight: '500',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    },
                }}
            />
        </>
    );
}