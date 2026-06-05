import React from 'react';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { 
    Plus, 
    UserPlus, 
    BookOpen, 
    Settings, 
    FileText, 
    Download,
    Upload,
    Bell,
    Shield,
    Database
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function QuickActions({ userRole = 'admin', className = '' }) {
    const getActions = () => {
        switch (userRole) {
            case 'admin':
                return [
                    {
                        title: 'Tambah Siswa',
                        description: 'Daftarkan siswa baru',
                        href: '/admin/users/students/create',
                        icon: UserPlus,
                        color: 'from-blue-500 to-blue-600',
                        hoverColor: 'hover:from-blue-600 hover:to-blue-700'
                    },
                    {
                        title: 'Tambah Instruktur',
                        description: 'Daftarkan instruktur baru',
                        href: '/admin/users/instructors/create',
                        icon: UserPlus,
                        color: 'from-green-500 to-green-600',
                        hoverColor: 'hover:from-green-600 hover:to-green-700'
                    },
                    {
                        title: 'Buat Pelatihan',
                        description: 'Tambah pelatihan baru',
                        href: '/admin/courses/create',
                        icon: BookOpen,
                        color: 'from-purple-500 to-purple-600',
                        hoverColor: 'hover:from-purple-600 hover:to-purple-700'
                    },
                    {
                        title: 'Laporan Sistem',
                        description: 'Lihat analytics & laporan',
                        href: '/admin/reports',
                        icon: FileText,
                        color: 'from-indigo-500 to-indigo-600',
                        hoverColor: 'hover:from-indigo-600 hover:to-indigo-700'
                    },
                    {
                        title: 'Pengaturan',
                        description: 'Konfigurasi sistem',
                        href: '/admin/settings',
                        icon: Settings,
                        color: 'from-gray-500 to-gray-600',
                        hoverColor: 'hover:from-gray-600 hover:to-gray-700'
                    },
                    {
                        title: 'Pesan',
                        description: 'Kelola pesan pengguna',
                        href: '/admin/messages',
                        icon: Bell,
                        color: 'from-orange-500 to-orange-600',
                        hoverColor: 'hover:from-orange-600 hover:to-orange-700'
                    }
                ];
            
            case 'instructor':
                return [
                    {
                        title: 'Pelatihan Baru',
                        description: 'Buat pelatihan baru',
                        href: '/instructor/courses/create',
                        icon: Plus,
                        color: 'from-blue-500 to-blue-600',
                        hoverColor: 'hover:from-blue-600 hover:to-blue-700'
                    },
                    {
                        title: 'Pelatihan Saya',
                        description: 'Kelola pelatihan yang dibuat',
                        href: '/instructor/courses',
                        icon: BookOpen,
                        color: 'from-green-500 to-green-600',
                        hoverColor: 'hover:from-green-600 hover:to-green-700'
                    }
                ];
            
            default: // student
                return [
                    {
                        title: 'Jelajahi Pelatihan',
                        description: 'Temukan pelatihan baru',
                        href: '/courses',
                        icon: BookOpen,
                        color: 'from-blue-500 to-blue-600',
                        hoverColor: 'hover:from-blue-600 hover:to-blue-700'
                    },
                    {
                        title: 'Pembelajaran Saya',
                        description: 'Lanjutkan belajar',
                        href: '/my-courses',
                        icon: Plus,
                        color: 'from-green-500 to-green-600',
                        hoverColor: 'hover:from-green-600 hover:to-green-700'
                    },
                    {
                        title: 'Sertifikat',
                        description: 'Lihat sertifikat saya',
                        href: '/certificates',
                        icon: Download,
                        color: 'from-purple-500 to-purple-600',
                        hoverColor: 'hover:from-purple-600 hover:to-purple-700'
                    }
                ];
        }
    };

    const actions = getActions();

    return (
        <motion.div 
            className={cn("bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6", className)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Quick Actions</h3>
                <Bell className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {actions.map((action, index) => {
                    const Icon = action.icon;
                    
                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                            <Link
                                href={action.href}
                                className={cn(
                                    "block p-4 rounded-xl border border-gray-200 hover:border-transparent transition-all duration-300 group hover:shadow-lg transform hover:scale-105 h-full",
                                    "bg-gradient-to-br", action.color, action.hoverColor
                                )}
                            >
                                <div className="flex flex-col items-center text-center space-y-3">
                                    <div className="flex-shrink-0">
                                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-semibold text-white mb-1">
                                            {action.title}
                                        </h4>
                                        <p className="text-xs text-white/80 line-clamp-2">
                                            {action.description}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    );
                })}
            </div>
            
        </motion.div>
    );
}