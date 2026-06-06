import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import AppLayout from '../../Layouts/AppLayout';
import { getRoutePrefix } from '../../Utils/roleHelper';
import {
    MessageCircle,
    Plus,
    Search,
    User,
    Clock,
    Mail,
    MailOpen,
    Send,
    Users,
    Filter
} from 'lucide-react';

export default function MessagesIndex({ conversations, routePrefix = 'student' }) {
    const { auth } = usePage().props;
    const [searchTerm, setSearchTerm] = useState('');

    // Get route prefix from user role (more reliable than prop)
    const detectedRoutePrefix = auth?.user ? getRoutePrefix(auth.user) : routePrefix;
    const actualRoutePrefix = detectedRoutePrefix || routePrefix;

    const filteredConversations = conversations.data.filter(conversation => {
        const otherParticipants = conversation.other_participants || [];
        const searchLower = searchTerm.toLowerCase();
        
        return (
            conversation.subject.toLowerCase().includes(searchLower) ||
            otherParticipants.some(participant => 
                `${participant.first_name} ${participant.last_name}`.toLowerCase().includes(searchLower) ||
                participant.email.toLowerCase().includes(searchLower)
            )
        );
    });

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);

        if (diffInHours < 1) {
            return `${Math.floor((now - date) / (1000 * 60))} min ago`;
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)} hours ago`;
        } else if (diffInHours < 48) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString();
        }
    };

    const getParticipantNames = (otherParticipants) => {
        if (otherParticipants.length === 0) return 'You';
        if (otherParticipants.length === 1) {
            return `${otherParticipants[0].first_name} ${otherParticipants[0].last_name}`;
        }
        return `${otherParticipants[0].first_name} ${otherParticipants[0].last_name} +${otherParticipants.length - 1} others`;
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'admin': return 'bg-red-100 text-red-800';
            case 'instructor': return 'bg-blue-100 text-blue-800';
            case 'sub_admin': return 'bg-purple-100 text-purple-800';
            case 'student': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AppLayout title="Messages">
            <Head title="Messages" />
            <div className="p-4 lg:px-6 lg:pt-4 lg:pb-6 space-y-6">
                {/* Header */}
                <motion.div
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Messages</h1>
                            <p className="text-sm sm:text-base text-gray-600">Stay connected with instructors and students</p>
                        </div>
                    </div>

                    <Link
                        href={route(`${actualRoutePrefix}.messages.create`)}
                        className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg text-sm sm:text-base"
                    >
                        <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="font-medium">New Message</span>
                    </Link>
                </motion.div>

                {/* Search and Stats */}
                <motion.div
                    className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                        <div className="relative flex-1 sm:max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                            />
                        </div>

                        <div className="flex items-center">
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                                <MessageCircle className="w-4 h-4" />
                                <span>{conversations.total} conversations</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Conversations List */}
                <motion.div
                    className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    {filteredConversations.length === 0 ? (
                        <div className="text-center py-8 sm:py-12 px-4">
                            <MessageCircle className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                                {searchTerm ? 'No conversations found' : 'No messages yet'}
                            </h3>
                            <p className="text-sm sm:text-base text-gray-500 mb-6">
                                {searchTerm
                                    ? 'Try adjusting your search terms'
                                    : 'Start a conversation with instructors or students'}
                            </p>
                            <Link
                                href={route(`${actualRoutePrefix}.messages.create`)}
                                className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm sm:text-base"
                            >
                                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span>Send First Message</span>
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {filteredConversations.map((conversation, index) => (
                                <motion.div
                                    key={conversation.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Link
                                        href={route(`${actualRoutePrefix}.messages.show`, conversation.id)}
                                        className="block p-4 sm:p-6 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-start gap-3 sm:gap-4">
                                            {/* Avatar */}
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                {conversation.other_participants?.length > 1 ? (
                                                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                                ) : (
                                                    <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start sm:items-center justify-between gap-2 mb-1">
                                                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">
                                                        {conversation.subject}
                                                    </h3>
                                                    <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                                                        {conversation.unread_count > 0 && (
                                                            <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-600 text-white text-xs rounded-full">
                                                                {conversation.unread_count}
                                                            </span>
                                                        )}
                                                        <span className="text-xs text-gray-500 whitespace-nowrap">
                                                            {formatTime(conversation.last_message_at)}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                                    <p className="text-xs sm:text-sm text-gray-600 truncate">
                                                        with {getParticipantNames(conversation.other_participants)}
                                                    </p>
                                                    {conversation.other_participants.length === 1 && conversation.other_participants[0].role && (
                                                        <span className={`px-1.5 sm:px-2 py-0.5 text-xs font-medium rounded-full capitalize ${getRoleBadgeColor(conversation.other_participants[0].role)}`}>
                                                            {conversation.other_participants[0].role}
                                                        </span>
                                                    )}
                                                    <div className="ml-auto flex-shrink-0">
                                                        {conversation.unread_count > 0 ? (
                                                            <Mail className="w-4 h-4 text-blue-600" />
                                                        ) : (
                                                            <MailOpen className="w-4 h-4 text-gray-400" />
                                                        )}
                                                    </div>
                                                </div>

                                                {conversation.latest_message && (
                                                    <p className="text-xs sm:text-sm text-gray-500 mt-1.5 sm:mt-2 line-clamp-1">
                                                        <span className="font-medium">
                                                            {conversation.latest_message.user.first_name}:
                                                        </span>{' '}
                                                        {conversation.latest_message.content}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Pagination */}
                {conversations.links && conversations.links.length > 3 && (
                    <motion.div
                        className="flex justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="flex flex-wrap justify-center gap-1">
                            {conversations.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                                        link.active
                                            ? 'bg-blue-600 text-white'
                                            : link.url
                                            ? 'text-gray-700 hover:bg-gray-100'
                                            : 'text-gray-400 cursor-not-allowed'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </AppLayout>
    );
}