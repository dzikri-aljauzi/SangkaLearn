import React, { useState, useRef } from 'react';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import EmojiPicker from 'emoji-picker-react';
import AppLayout from '../../Layouts/AppLayout';
import { getRoutePrefix, getMessageRoute } from '../../Utils/roleHelper';
import {
    ArrowLeft,
    Send,
    Search,
    User,
    Users,
    X,
    Check,
    MessageSquare,
    Paperclip,
    Smile,
    FileText,
    Image as ImageIcon
} from 'lucide-react';

export default function CreateMessage({ users, routePrefix = 'student', currentUserRole }) {
    const { auth } = usePage().props;
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [showUserList, setShowUserList] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);

    const fileInputRef = useRef(null);
    const messageInputRef = useRef(null);

    // Get route prefix from user role (more reliable than prop)
    const detectedRoutePrefix = auth?.user ? getRoutePrefix(auth.user) : routePrefix;
    const actualRoutePrefix = detectedRoutePrefix || routePrefix;

    // Get user role
    const userRole = currentUserRole || auth?.user?.roles?.[0]?.name || 'student';
    const isStudent = userRole === 'student';

    const { data, setData, post, processing, errors } = useForm({
        recipients: [],
        subject: '',
        content: '',
        attachments: [],
    });

    const filteredUsers = users.filter(user => {
        const searchLower = searchTerm.toLowerCase();
        return (
            `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchLower) ||
            user.email.toLowerCase().includes(searchLower)
        ) && !selectedUsers.some(selected => selected.id === user.id);
    });

    const handleUserSelect = (user) => {
        const newSelectedUsers = [...selectedUsers, user];
        setSelectedUsers(newSelectedUsers);
        setData('recipients', newSelectedUsers.map(u => u.id));
        setSearchTerm('');
        setShowUserList(false);
    };

    const handleUserRemove = (userId) => {
        const newSelectedUsers = selectedUsers.filter(user => user.id !== userId);
        setSelectedUsers(newSelectedUsers);
        setData('recipients', newSelectedUsers.map(u => u.id));
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + selectedFiles.length > 5) {
            toast.error('Maximum 5 files allowed');
            return;
        }
        setSelectedFiles(prev => [...prev, ...files]);
        e.target.value = '';
    };

    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleEmojiClick = (emojiData) => {
        const emoji = emojiData.emoji;
        const textarea = messageInputRef.current;
        if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = data.content;
            const newText = text.substring(0, start) + emoji + text.substring(end);

            setData('content', newText);

            setTimeout(() => {
                textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
                textarea.focus();
            }, 10);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const getFileIcon = (type) => {
        if (type.startsWith('image/')) return <ImageIcon className="w-4 h-4" />;
        return <FileText className="w-4 h-4" />;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (selectedUsers.length === 0) {
            toast.error('Please select at least one recipient');
            return;
        }

        if (!data.subject || !data.subject.trim()) {
            toast.error('Please enter a subject');
            return;
        }

        if (!data.content || !data.content.trim()) {
            toast.error('Please enter a message');
            return;
        }

        // Build route name
        const routeName = `${actualRoutePrefix}.messages.store`;

        // Check if route exists
        try {
            route(routeName);
        } catch (error) {
            console.error('❌ Route Resolution Error:', error);
            toast.error(`Route "${routeName}" not found in Ziggy routes. Please refresh the page.`);
            return;
        }

        // If there are file attachments, use FormData
        if (selectedFiles.length > 0) {
            const formData = new FormData();
            formData.append('subject', data.subject);
            formData.append('content', data.content);
            selectedUsers.forEach((user, index) => {
                formData.append(`recipients[${index}]`, user.id);
            });
            selectedFiles.forEach((file) => {
                formData.append('attachments[]', file);
            });

            router.post(route(routeName), formData, {
                onSuccess: () => {
                    toast.success('Message sent successfully!');
                },
                onError: (errors) => {
                    if (errors.recipients) {
                        toast.error(errors.recipients);
                    } else if (errors.subject) {
                        toast.error(errors.subject);
                    } else if (errors.content) {
                        toast.error(errors.content);
                    } else if (errors.error) {
                        toast.error(errors.error);
                    } else {
                        toast.error('Failed to send message. Please check your input and try again.');
                    }
                },
                preserveScroll: true
            });
        } else {
            // Text-only message
            post(route(routeName), {
                onSuccess: (response) => {
                    toast.success('Message sent successfully!');
                },
                onError: (errors) => {
                    if (errors.recipients) {
                        toast.error(errors.recipients);
                    } else if (errors.subject) {
                        toast.error(errors.subject);
                    } else if (errors.content) {
                        toast.error(errors.content);
                    } else if (errors.error) {
                        toast.error(errors.error);
                    } else {
                        toast.error('Failed to send message. Please check your input and try again.');
                    }
                },
                preserveScroll: true
            });
        }
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
        <AppLayout title="New Message">
            <Head title="New Message" />
            <div className="p-4 lg:px-6 lg:pt-4 lg:pb-6 space-y-6">
                {/* Header */}
                <motion.div 
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => window.history.back()}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                                <MessageSquare className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">New Message</h1>
                                <p className="text-gray-600 mt-1">Start a conversation</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Message Form */}
                <motion.div 
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Recipients Section */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {isStudent ? 'Select Admin to Contact' : 'Recipients'}
                            </label>

                            {/* For Students: Show Admin List Directly */}
                            {isStudent ? (
                                <div className="space-y-2">
                                    {users.length === 0 ? (
                                        <p className="text-gray-500 text-sm py-4 text-center">
                                            No admins available at the moment
                                        </p>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                                            {users.map((user) => (
                                                <button
                                                    key={user.id}
                                                    type="button"
                                                    onClick={() => {
                                                        const isSelected = selectedUsers.some(u => u.id === user.id);
                                                        if (isSelected) {
                                                            handleUserRemove(user.id);
                                                        } else {
                                                            handleUserSelect(user);
                                                        }
                                                    }}
                                                    className={`w-full flex items-center space-x-3 p-3 rounded-lg border-2 transition-all ${
                                                        selectedUsers.some(u => u.id === user.id)
                                                            ? 'border-blue-500 bg-blue-50'
                                                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                        selectedUsers.some(u => u.id === user.id)
                                                            ? 'bg-blue-600'
                                                            : 'bg-red-500'
                                                    }`}>
                                                        <User className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div className="flex-1 text-left">
                                                        <div className="flex items-center space-x-2">
                                                            <p className="text-sm font-semibold text-gray-900">
                                                                {user.first_name} {user.last_name}
                                                            </p>
                                                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-800">
                                                                Admin
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-500">{user.email}</p>
                                                    </div>
                                                    {selectedUsers.some(u => u.id === user.id) && (
                                                        <Check className="w-5 h-5 text-blue-600" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {errors.recipients && (
                                        <p className="text-red-500 text-sm mt-2">{errors.recipients}</p>
                                    )}
                                </div>
                            ) : (
                                // For Other Roles: Show Original Search Interface
                                <>
                                    {/* Selected Users */}
                                    {selectedUsers.length > 0 && (
                                        <div className="mb-3 flex flex-wrap gap-2">
                                            {selectedUsers.map((user) => (
                                                <div
                                                    key={user.id}
                                                    className="flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                                >
                                                    <User className="w-3 h-3" />
                                                    <span>{user.first_name} {user.last_name}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleUserRemove(user.id)}
                                                        className="text-blue-600 hover:text-blue-800"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* User Search */}
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            placeholder="Search for users to add..."
                                            value={searchTerm}
                                            onChange={(e) => {
                                                setSearchTerm(e.target.value);
                                                setShowUserList(e.target.value.length > 0);
                                            }}
                                            onFocus={() => setShowUserList(searchTerm.length > 0)}
                                            className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />

                                        {/* User Dropdown */}
                                        {showUserList && filteredUsers.length > 0 && (
                                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                                                {filteredUsers.slice(0, 10).map((user) => (
                                                    <button
                                                        key={user.id}
                                                        type="button"
                                                        onClick={() => handleUserSelect(user)}
                                                        className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 text-left"
                                                    >
                                                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                                            <User className="w-4 h-4 text-white" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center space-x-2">
                                                                <p className="text-sm font-medium text-gray-900">
                                                                    {user.first_name} {user.last_name}
                                                                </p>
                                                                {user.role && (
                                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getRoleBadgeColor(user.role)}`}>
                                                                        {user.role}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                                        </div>
                                                        <Check className="w-4 h-4 text-gray-400" />
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {errors.recipients && (
                                        <p className="text-red-500 text-sm mt-1">{errors.recipients}</p>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Subject */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Subject
                            </label>
                            <input
                                type="text"
                                value={data.subject}
                                onChange={(e) => setData('subject', e.target.value)}
                                placeholder="Enter message subject..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                            {errors.subject && (
                                <p className="text-red-500 text-sm mt-1">{errors.subject}</p>
                            )}
                        </div>

                        {/* Content */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Message
                            </label>

                            {/* Emoji Picker */}
                            <AnimatePresence>
                                {showEmojiPicker && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 20 }}
                                        className="mb-2"
                                    >
                                        <div className="relative inline-block">
                                            <EmojiPicker
                                                onEmojiClick={handleEmojiClick}
                                                width={320}
                                                height={400}
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* File Attachments Preview */}
                            {selectedFiles.length > 0 && (
                                <div className="mb-3 flex flex-wrap gap-2">
                                    {selectedFiles.map((file, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2 pr-2"
                                        >
                                            {getFileIcon(file.type)}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                                    {file.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {formatFileSize(file.size)}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeFile(index)}
                                                className="p-1 hover:bg-gray-200 rounded transition-colors"
                                            >
                                                <X className="w-4 h-4 text-gray-500" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            {/* Message Textarea with Buttons */}
                            <div className="relative">
                                <textarea
                                    ref={messageInputRef}
                                    value={data.content}
                                    onChange={(e) => setData('content', e.target.value)}
                                    placeholder="Type your message here..."
                                    rows={8}
                                    className="w-full px-4 py-3 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    required
                                />

                                {/* Hidden file input */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.txt"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />

                                {/* Attachment and Emoji Buttons */}
                                <div className="absolute right-3 top-3 flex items-center space-x-1">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                        title="Attach file"
                                    >
                                        <Paperclip className="w-5 h-5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                        className={`p-2 transition-colors ${showEmojiPicker ? 'text-blue-600' : 'text-gray-400 hover:text-blue-600'}`}
                                        title="Add emoji"
                                    >
                                        <Smile className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {errors.content && (
                                <p className="text-red-500 text-sm mt-1">{errors.content}</p>
                            )}
                        </div>

                        {/* General Error Display */}
                        {errors.error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-600">{errors.error}</p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                            <div className="text-sm text-gray-500">
                                {selectedUsers.length > 0 && (
                                    <span>
                                        {selectedUsers.length} recipient{selectedUsers.length !== 1 ? 's' : ''} selected
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center space-x-3">
                                <button
                                    type="button"
                                    onClick={() => window.history.back()}
                                    disabled={processing}
                                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing || selectedUsers.length === 0}
                                    className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {processing ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Sending...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            <span>Send Message</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AppLayout>
    );
}