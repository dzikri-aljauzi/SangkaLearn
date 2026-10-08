import React, { useState, useRef, useEffect } from 'react';
import { Head, useForm, Link, usePage, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import EmojiPicker from 'emoji-picker-react';
import AppLayout from '../../Layouts/AppLayout';
import useRealtimeMessaging from '../../Hooks/useRealtimeMessaging';
import { messageNotifications } from '../../Utils/messageNotifications';
import { getRoutePrefix } from '../../Utils/roleHelper';
import {
    ArrowLeft,
    Send,
    User,
    Users,
    MessageCircle,
    Clock,
    Check,
    CheckCheck,
    Paperclip,
    Smile,
    MoreVertical,
    Wifi,
    WifiOff,
    X,
    FileText,
    Image as ImageIcon,
    Download,
    Edit,
    Trash2
} from 'lucide-react';

export default function ShowMessage({ conversation, messages: initialMessages, participants, routePrefix = 'student' }) {
    const { auth, flash } = usePage().props;

    // Get route prefix from user role (more reliable than prop)
    const detectedRoutePrefix = auth?.user ? getRoutePrefix(auth.user) : routePrefix;
    const actualRoutePrefix = detectedRoutePrefix || routePrefix;
    const messagesEndRef = useRef(null);
    const messageInputRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const fileInputRef = useRef(null);

    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [editAttachments, setEditAttachments] = useState([]);
    const [editSelectedFiles, setEditSelectedFiles] = useState([]);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    const [dropdownOpenId, setDropdownOpenId] = useState(null);
    const editFileInputRef = useRef(null);

    const { data, setData, processing, reset } = useForm({
        content: '',
        attachments: [],
    });

    // Use real-time messaging hook
    const {
        messages,
        typingUsers,
        isConnected,
        sendMessage,
        sendTypingIndicator,
        markAsRead,
        getTypingText
    } = useRealtimeMessaging(conversation?.id, initialMessages?.data || [], actualRoutePrefix, auth?.user);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Mark messages as read when component mounts and when new messages arrive
    useEffect(() => {
        if (conversation?.id) {
            markAsRead();
        }
    }, [conversation?.id, markAsRead]);

    // Request notification permission when component mounts
    useEffect(() => {
        messageNotifications.requestPermission();
    }, []);

    // Handle flash messages from backend
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!data.content.trim() && selectedFiles.length === 0) {
            toast.error('Please enter a message or attach a file');
            return;
        }

        // If there are file attachments, use FormData
        if (selectedFiles.length > 0) {
            const formData = new FormData();
            formData.append('content', data.content);
            selectedFiles.forEach((file) => {
                formData.append('attachments[]', file);
            });

            router.post(route(`${actualRoutePrefix}.messages.send`, conversation.id), formData, {
                onSuccess: () => {
                    reset('content');
                    setSelectedFiles([]);
                    setShowEmojiPicker(false);
                    messageInputRef.current?.focus();
                    sendTypingIndicator(false);
                    toast.success('Message sent!');
                },
                onError: (errors) => {
                    console.error('Send message error:', errors);
                    toast.error('Failed to send message');
                }
            });
        } else {
            // Text-only message
            const success = await sendMessage(data.content);
            if (success) {
                reset('content');
                setShowEmojiPicker(false);
                messageInputRef.current?.focus();
                sendTypingIndicator(false);
            }
        }
    };

    // Handle typing indicators
    const handleInputChange = (e) => {
        setData('content', e.target.value);
        
        // Send typing indicator
        sendTypingIndicator(true);
        
        // Clear previous timeout
        clearTimeout(typingTimeoutRef.current);
        
        // Stop typing indicator after 1 second of inactivity
        typingTimeoutRef.current = setTimeout(() => {
            sendTypingIndicator(false);
        }, 1000);
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);

        if (diffInHours < 1) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)} hours ago`;
        } else if (diffInHours < 48) {
            return `Yesterday ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else {
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    };

    const getParticipantNames = () => {
        if (participants.length === 0) return 'You';
        if (participants.length === 1) {
            return `${participants[0].first_name} ${participants[0].last_name}`;
        }
        return `${participants[0].first_name} ${participants[0].last_name} +${participants.length - 1} others`;
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
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
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = data.content;
        const newText = text.substring(0, start) + emoji + text.substring(end);

        setData('content', newText);

        // Set cursor position after emoji
        setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
            textarea.focus();
        }, 10);
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

    // Check if message can be edited/deleted (within 5 minutes)
    const canEditDelete = (messageDate) => {
        const now = new Date();
        const messageTime = new Date(messageDate);
        const diffInMinutes = (now - messageTime) / (1000 * 60);
        return diffInMinutes <= 5;
    };

    // Start editing a message
    const startEdit = (message) => {
        setEditingMessageId(message.id);
        setEditContent(message.content);
        setEditAttachments(message.attachments ? JSON.parse(message.attachments) : []);
        setEditSelectedFiles([]);
        setDropdownOpenId(null);
    };

    // Cancel editing
    const cancelEdit = () => {
        setEditingMessageId(null);
        setEditContent('');
        setEditAttachments([]);
        setEditSelectedFiles([]);
    };

    // Handle edit file selection
    const handleEditFileSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + editAttachments.length + editSelectedFiles.length > 5) {
            toast.error('Maximum 5 files allowed');
            return;
        }
        setEditSelectedFiles(prev => [...prev, ...files]);
        e.target.value = '';
    };

    // Remove existing attachment
    const removeExistingAttachment = (index) => {
        setEditAttachments(prev => prev.filter((_, i) => i !== index));
    };

    // Remove new file from edit
    const removeEditFile = (index) => {
        setEditSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    // Submit edit
    const submitEdit = () => {
        if (!editContent.trim() && editAttachments.length === 0 && editSelectedFiles.length === 0) {
            toast.error('Message cannot be empty');
            return;
        }

        const formData = new FormData();
        formData.append('content', editContent);
        formData.append('_method', 'PATCH');

        // Add existing attachment indices to keep
        editAttachments.forEach((_, index) => {
            formData.append('existing_attachments[]', index);
        });

        // Add new files
        editSelectedFiles.forEach((file) => {
            formData.append('attachments[]', file);
        });

        router.post(route(`${actualRoutePrefix}.messages.update`, editingMessageId), formData, {
            onSuccess: () => {
                cancelEdit();
            }
        });
    };

    // Confirm delete
    const confirmDelete = (messageId) => {
        setDeleteConfirmId(messageId);
        setDropdownOpenId(null);
    };

    // Cancel delete
    const cancelDelete = () => {
        setDeleteConfirmId(null);
    };

    // Delete message
    const deleteMessage = () => {
        router.delete(route(`${actualRoutePrefix}.messages.delete`, deleteConfirmId), {
            onFinish: () => {
                setDeleteConfirmId(null);
            }
        });
    };

    return (
        <AppLayout title={`Message: ${conversation.subject}`}>
            <Head title={`Message: ${conversation.subject}`} />
            
            <div className="flex flex-col h-screen bg-gray-50">
                {/* Header */}
                <motion.div 
                    className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between shadow-sm"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center space-x-4">
                        <Link
                            href={route(`${actualRoutePrefix}.messages.index`)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </Link>
                        
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                                {participants.length > 1 ? (
                                    <Users className="w-5 h-5 text-white" />
                                ) : (
                                    <User className="w-5 h-5 text-white" />
                                )}
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold text-gray-900 truncate max-w-xs lg:max-w-md">
                                    {conversation.subject}
                                </h1>
                                <p className="text-sm text-gray-600">
                                    with {getParticipantNames()}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-2 text-sm text-gray-500 hidden sm:flex">
                            {isConnected ? (
                                <Wifi className="w-4 h-4 text-green-500" />
                            ) : (
                                <WifiOff className="w-4 h-4 text-red-500" />
                            )}
                            <span>{participants.length + 1} participant{participants.length !== 0 ? 's' : ''}</span>
                        </div>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <MoreVertical className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                </motion.div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                        <div className="text-center py-12">
                            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                            <p className="text-gray-500">Start the conversation by sending a message below.</p>
                        </div>
                    ) : (
                        <>
                            {messages.map((message, index) => {
                                const isCurrentUser = message.user.id === auth.user?.id;
                                const showDate = index === 0 || 
                                    new Date(message.created_at).toDateString() !== 
                                    new Date(messages[index - 1].created_at).toDateString();

                                return (
                                    <div key={message.id}>
                                        {/* Date separator */}
                                        {showDate && (
                                            <div className="flex items-center justify-center py-2">
                                                <div className="bg-gray-100 px-3 py-1 rounded-full">
                                                    <span className="text-xs font-medium text-gray-600">
                                                        {new Date(message.created_at).toLocaleDateString([], {
                                                            weekday: 'long',
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Message bubble */}
                                        <motion.div
                                            className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <div className={`max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-xl ${
                                                isCurrentUser ? 'order-2' : 'order-1'
                                            }`}>
                                                {!isCurrentUser && (
                                                    <div className="flex items-center space-x-2 mb-1">
                                                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                                            <User className="w-3 h-3 text-white" />
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-700">
                                                            {message.user.first_name} {message.user.last_name}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Check if message is deleted */}
                                                {message.deleted_at ? (
                                                    <div className={`px-4 py-3 rounded-2xl ${
                                                        isCurrentUser
                                                            ? 'bg-gray-200 text-gray-500 rounded-br-md'
                                                            : 'bg-gray-100 border border-gray-200 text-gray-500 rounded-bl-md'
                                                    } shadow-sm italic`}>
                                                        <p className="text-sm">
                                                            This message was deleted
                                                        </p>
                                                    </div>
                                                ) : editingMessageId === message.id ? (
                                                    /* Edit Mode */
                                                    <div className={`px-4 py-3 rounded-2xl ${
                                                        isCurrentUser
                                                            ? 'bg-blue-50 border-2 border-blue-600 rounded-br-md'
                                                            : 'bg-white border-2 border-blue-600 rounded-bl-md'
                                                    } shadow-sm`}>
                                                        <textarea
                                                            value={editContent}
                                                            onChange={(e) => setEditContent(e.target.value)}
                                                            className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                                            placeholder="Edit message..."
                                                        />

                                                        {/* Existing Attachments */}
                                                        {editAttachments.length > 0 && (
                                                            <div className="mt-2 space-y-1">
                                                                <p className="text-xs text-gray-600">Existing files:</p>
                                                                {editAttachments.map((attachment, idx) => (
                                                                    <div key={idx} className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
                                                                        {getFileIcon(attachment.type)}
                                                                        <span className="ml-2 text-sm flex-1 truncate">{attachment.name}</span>
                                                                        <button
                                                                            onClick={() => removeExistingAttachment(idx)}
                                                                            className="ml-2 text-red-500 hover:text-red-700"
                                                                        >
                                                                            <X className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {/* New Files */}
                                                        {editSelectedFiles.length > 0 && (
                                                            <div className="mt-2 space-y-1">
                                                                <p className="text-xs text-gray-600">New files:</p>
                                                                {editSelectedFiles.map((file, idx) => (
                                                                    <div key={idx} className="flex items-center bg-blue-50 rounded-lg px-3 py-2">
                                                                        {getFileIcon(file.type)}
                                                                        <span className="ml-2 text-sm flex-1 truncate">{file.name}</span>
                                                                        <button
                                                                            onClick={() => removeEditFile(idx)}
                                                                            className="ml-2 text-red-500 hover:text-red-700"
                                                                        >
                                                                            <X className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                        <input
                                                            ref={editFileInputRef}
                                                            type="file"
                                                            multiple
                                                            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.txt"
                                                            onChange={handleEditFileSelect}
                                                            className="hidden"
                                                        />

                                                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-200">
                                                            <button
                                                                onClick={() => editFileInputRef.current?.click()}
                                                                className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                                                            >
                                                                <Paperclip className="w-4 h-4 mr-1" />
                                                                Add files
                                                            </button>
                                                            <div className="flex space-x-2">
                                                                <button
                                                                    onClick={cancelEdit}
                                                                    className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
                                                                >
                                                                    Cancel
                                                                </button>
                                                                <button
                                                                    onClick={submitEdit}
                                                                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                                                                >
                                                                    Save
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    /* Normal Message Display */
                                                    <div className="relative group">
                                                        {/* Dropdown Menu */}
                                                        {isCurrentUser && canEditDelete(message.created_at) && (
                                                            <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                                <div className="relative">
                                                                    <button
                                                                        onClick={() => setDropdownOpenId(dropdownOpenId === message.id ? null : message.id)}
                                                                        className="p-1 bg-white border border-gray-300 rounded-full shadow-sm hover:bg-gray-50"
                                                                    >
                                                                        <MoreVertical className="w-4 h-4 text-gray-600" />
                                                                    </button>

                                                                    {/* Dropdown Content */}
                                                                    {dropdownOpenId === message.id && (
                                                                        <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[120px]">
                                                                            <button
                                                                                onClick={() => startEdit(message)}
                                                                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                                                            >
                                                                                <Edit className="w-4 h-4 mr-2" />
                                                                                Edit
                                                                            </button>
                                                                            <button
                                                                                onClick={() => confirmDelete(message.id)}
                                                                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                                                                            >
                                                                                <Trash2 className="w-4 h-4 mr-2" />
                                                                                Delete
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className={`px-4 py-3 rounded-2xl ${
                                                            isCurrentUser
                                                                ? 'bg-blue-600 text-white rounded-br-md'
                                                                : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md'
                                                        } shadow-sm`}>
                                                            <p className="text-sm whitespace-pre-wrap break-words">
                                                                {message.content}
                                                            </p>

                                                            {/* Display attachments */}
                                                            {message.attachments && JSON.parse(message.attachments).length > 0 && (
                                                                <div className="mt-2 space-y-2">
                                                                    {JSON.parse(message.attachments).map((attachment, idx) => {
                                                                        const isImage = attachment.type?.startsWith('image/');
                                                                        return (
                                                                            <div key={idx} className={`${isImage ? '' : 'flex items-center space-x-2 p-2 rounded-lg'} ${isCurrentUser ? 'bg-blue-500' : 'bg-gray-100'}`}>
                                                                                {isImage ? (
                                                                                    <a
                                                                                        href={`/storage/${attachment.path}`}
                                                                                        target="_blank"
                                                                                        rel="noopener noreferrer"
                                                                                        className="block"
                                                                                    >
                                                                                        <img
                                                                                            src={`/storage/${attachment.path}`}
                                                                                            alt={attachment.name}
                                                                                            className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                                                                        />
                                                                                    </a>
                                                                                ) : (
                                                                                    <>
                                                                                        <FileText className={`w-5 h-5 ${isCurrentUser ? 'text-white' : 'text-gray-600'}`} />
                                                                                        <div className="flex-1 min-w-0">
                                                                                            <p className={`text-sm font-medium truncate ${isCurrentUser ? 'text-white' : 'text-gray-900'}`}>
                                                                                                {attachment.name}
                                                                                            </p>
                                                                                            <p className={`text-xs ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}>
                                                                                                {formatFileSize(attachment.size)}
                                                                                            </p>
                                                                                        </div>
                                                                                        <a
                                                                                            href={`/storage/${attachment.path}`}
                                                                                            download={attachment.name}
                                                                                            className={`p-1 rounded hover:bg-opacity-20 ${isCurrentUser ? 'hover:bg-white text-white' : 'hover:bg-gray-200 text-gray-600'}`}
                                                                                        >
                                                                                            <Download className="w-4 h-4" />
                                                                                        </a>
                                                                                    </>
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className={`flex items-center space-x-1 mt-1 ${
                                                    isCurrentUser ? 'justify-end' : 'justify-start'
                                                }`}>
                                                    <Clock className="w-3 h-3 text-gray-400" />
                                                    <span className="text-xs text-gray-500">
                                                        {formatTime(message.created_at)}
                                                    </span>
                                                    {message.edited_at && !message.deleted_at && (
                                                        <span className="text-xs text-gray-400 italic ml-1">
                                                            (Edited)
                                                        </span>
                                                    )}
                                                    {isCurrentUser && (
                                                        <div className="ml-1">
                                                            <Check className="w-3 h-3 text-gray-400" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>

                {/* Delete Confirmation Modal */}
                <AnimatePresence>
                    {deleteConfirmId && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                            onClick={cancelDelete}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                                    <Trash2 className="w-6 h-6 text-red-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                                    Delete Message?
                                </h3>
                                <p className="text-sm text-gray-600 text-center mb-6">
                                    This action cannot be undone. The message will be permanently deleted.
                                </p>
                                <div className="flex space-x-3">
                                    <button
                                        onClick={cancelDelete}
                                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={deleteMessage}
                                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Message Input */}
                <motion.div
                    className="bg-white border-t border-gray-200 px-4 py-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
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

                    <form onSubmit={handleSubmit} className="flex items-end space-x-3">
                        <div className="flex-1">
                            <div className="relative">
                                <textarea
                                    ref={messageInputRef}
                                    value={data.content}
                                    onChange={handleInputChange}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Type your message..."
                                    rows={1}
                                    className="w-full px-4 py-3 pr-20 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    style={{
                                        minHeight: '48px',
                                        maxHeight: '120px',
                                        resize: 'none'
                                    }}
                                    onInput={(e) => {
                                        e.target.style.height = 'auto';
                                        e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                                    }}
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

                                <div className="absolute right-3 bottom-3 flex items-center space-x-1">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                        title="Attach file"
                                    >
                                        <Paperclip className="w-5 h-5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                        className={`p-1 transition-colors ${showEmojiPicker ? 'text-blue-600' : 'text-gray-400 hover:text-blue-600'}`}
                                        title="Add emoji"
                                    >
                                        <Smile className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={processing || (!data.content.trim() && selectedFiles.length === 0)}
                            className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                    
                    {getTypingText() && (
                        <motion.div 
                            className="mt-2 text-sm text-gray-500 flex items-center space-x-2"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            </div>
                            <span>{getTypingText()}</span>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </AppLayout>
    );
}