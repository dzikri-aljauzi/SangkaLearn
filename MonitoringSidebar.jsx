import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { 
    Activity,
    FileText,
    HelpCircle,
    BookOpen,
    Users,
    TrendingUp,
    ChevronDown,
    ChevronRight,
    Eye,
    Download,
    BarChart3
} from 'lucide-react';

export default function MonitoringSidebar() {
    const { url } = usePage();
    const [expandedSections, setExpandedSections] = useState({
        monitoring: true
    });

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const isActive = (routeName) => {
        return url.startsWith(`/admin/${routeName}`);
    };

    const sidebarItems = [
        {
            id: 'monitoring',
            title: 'Content Monitoring',
            icon: Activity,
            items: [
                {
                    name: 'Assignment Monitoring',
                    href: route('admin.assignments.monitoring.index'),
                    icon: FileText,
                    active: isActive('assignments/monitoring'),
                    description: 'Monitor student submissions and grade assignments'
                },
                {
                    name: 'Quiz Monitoring',
                    href: route('admin.quizzes.monitoring.index'),
                    icon: HelpCircle,
                    active: isActive('quizzes/monitoring'),
                    description: 'Track quiz attempts and analyze performance'
                }
            ]
        }
    ];

    return (
        <div className="w-80 bg-white shadow-xl border-r border-gray-200 h-screen overflow-y-auto sticky top-0">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                        <BarChart3 className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-3">
                        <h2 className="text-lg font-bold text-gray-900">Content Monitoring</h2>
                        <p className="text-sm text-gray-500">Track student progress</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="p-4">
                {sidebarItems.map((section) => (
                    <div key={section.id} className="mb-4">
                        <button
                            onClick={() => toggleSection(section.id)}
                            className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            <div className="flex items-center">
                                <section.icon className="h-5 w-5 text-gray-600 mr-3" />
                                <span className="font-medium text-gray-900">{section.title}</span>
                            </div>
                            {expandedSections[section.id] ? (
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                            ) : (
                                <ChevronRight className="h-4 w-4 text-gray-500" />
                            )}
                        </button>

                        {expandedSections[section.id] && (
                            <div className="ml-8 mt-2 space-y-1">
                                {section.items.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`group block p-3 rounded-lg transition-all duration-200 ${
                                            item.active
                                                ? 'bg-blue-50 border-l-4 border-blue-600 text-blue-700'
                                                : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
                                        }`}
                                    >
                                        <div className="flex items-center">
                                            <item.icon className={`h-4 w-4 mr-3 ${
                                                item.active ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'
                                            }`} />
                                            <div>
                                                <div className={`font-medium ${item.active ? 'text-blue-700' : ''}`}>
                                                    {item.name}
                                                </div>
                                                <div className={`text-xs mt-1 ${
                                                    item.active ? 'text-blue-600' : 'text-gray-500'
                                                }`}>
                                                    {item.description}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                {/* Quick Stats */}
                <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <TrendingUp className="h-4 w-4 mr-2 text-blue-600" />
                        Quick Actions
                    </h3>
                    <div className="space-y-2">
                        <Link
                            href={route('admin.assignments.monitoring.index')}
                            className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
                        >
                            <Eye className="h-3 w-3 mr-2" />
                            View All Assignments
                        </Link>
                        <Link
                            href={route('admin.quizzes.monitoring.index')}
                            className="flex items-center text-sm text-purple-600 hover:text-purple-800 transition-colors"
                        >
                            <Eye className="h-3 w-3 mr-2" />
                            View All Quizzes
                        </Link>
                    </div>
                </div>

                {/* Export Options */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Download className="h-4 w-4 mr-2 text-gray-600" />
                        Export Data
                    </h3>
                    <p className="text-xs text-gray-600 mb-3">
                        Export detailed reports for assignments and quizzes.
                    </p>
                    <div className="space-y-1">
                        <button className="w-full text-left text-xs text-gray-700 hover:text-gray-900 py-1">
                            → Assignment Reports
                        </button>
                        <button className="w-full text-left text-xs text-gray-700 hover:text-gray-900 py-1">
                            → Quiz Analytics
                        </button>
                    </div>
                </div>
            </nav>
        </div>
    );
}