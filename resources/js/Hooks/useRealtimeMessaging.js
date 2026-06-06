import { useState, useEffect, useRef, useCallback } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { messageNotifications } from '../Utils/messageNotifications';
import { getRoutePrefix } from '../Utils/roleHelper';

// Configure Echo for broadcasting (if available)
let echo = null;
if (window.Echo) {
    echo = window.Echo;
} else if (typeof window !== 'undefined') {
    // Fallback to polling if WebSocket is not available
    console.log('WebSocket not available, using polling for real-time updates');
}

export const useRealtimeMessaging = (conversationId, initialMessages = [], routePrefix = 'student', user = null) => {
    const [messages, setMessages] = useState(initialMessages);
    const [typingUsers, setTypingUsers] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [lastMessageTime, setLastMessageTime] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);

    const pollingIntervalRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const channelRef = useRef(null);

    // Detect route prefix from user if available
    const detectedPrefix = user ? getRoutePrefix(user) : routePrefix;
    const actualPrefix = detectedPrefix || routePrefix;

    // Debug logging
    useEffect(() => {
        console.log('🔧 useRealtimeMessaging initialized:', {
            conversationId,
            routePrefix,
            detectedPrefix,
            actualPrefix,
            user: user ? `${user.first_name} ${user.last_name}` : 'No user'
        });
    }, [conversationId, routePrefix, detectedPrefix, actualPrefix, user]);

    // Polling fallback function
    const pollForMessages = useCallback(async () => {
        if (!conversationId) return;

        try {
            const since = lastMessageTime || (messages.length > 0 ? messages[messages.length - 1]?.created_at : null);
            const apiUrl = `/${actualPrefix}/messages/${conversationId}/messages`;
            console.log('📡 Polling messages:', apiUrl);
            const response = await axios.get(apiUrl, {
                params: { since }
            });

            if (response.data.messages && response.data.messages.length > 0) {
                setMessages(prev => {
                    const newMessages = response.data.messages.filter(newMsg => 
                        !prev.some(existingMsg => existingMsg.id === newMsg.id)
                    );
                    
                    if (newMessages.length > 0) {
                        setLastMessageTime(newMessages[newMessages.length - 1].created_at);
                        return [...prev, ...newMessages];
                    }
                    return prev;
                });
            }
        } catch (error) {
            console.error('Error polling for messages:', error);
        }
    }, [conversationId, lastMessageTime, messages, actualPrefix]);

    // Setup real-time connection
    useEffect(() => {
        if (!conversationId) return;

        setIsConnected(false);

        // Try WebSocket first
        if (echo) {
            try {
                const channel = echo.private(`conversation.${conversationId}`);
                channelRef.current = channel;

                // Listen for new messages
                channel.listen('.message.sent', (data) => {
                    setMessages(prev => {
                        if (prev.some(msg => msg.id === data.message.id)) {
                            return prev;
                        }
                        return [...prev, data.message];
                    });
                    
                    // Show notification if user is not focused on window
                    if (messageNotifications.shouldShowNotification()) {
                        const senderName = `${data.message.user.first_name} ${data.message.user.last_name}`;
                        messageNotifications.showMessageNotification(
                            data.message.content,
                            senderName
                        );
                    }
                });

                // Listen for typing indicators
                channel.listen('.user.typing', (data) => {
                    setTypingUsers(prev => {
                        if (data.is_typing) {
                            if (!prev.some(user => user.id === data.user.id)) {
                                return [...prev, data.user];
                            }
                        } else {
                            return prev.filter(user => user.id !== data.user.id);
                        }
                        return prev;
                    });

                    // Clear typing after 3 seconds
                    clearTimeout(typingTimeoutRef.current);
                    typingTimeoutRef.current = setTimeout(() => {
                        setTypingUsers(prev => prev.filter(user => user.id !== data.user.id));
                    }, 3000);
                });

                // Listen for read receipts
                channel.listen('.message.read', (data) => {
                    // Update read status for messages
                    console.log('Message read by:', data.user);
                });

                setIsConnected(true);
                console.log('WebSocket connected for conversation:', conversationId);

            } catch (error) {
                console.error('WebSocket connection failed:', error);
                setupPolling();
            }
        } else {
            setupPolling();
        }

        return () => {
            if (channelRef.current) {
                channelRef.current.stopListening('.message.sent');
                channelRef.current.stopListening('.user.typing');
                channelRef.current.stopListening('.message.read');
                echo?.leave(`conversation.${conversationId}`);
            }
            
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
            
            clearTimeout(typingTimeoutRef.current);
        };
    }, [conversationId]);

    // Setup polling fallback
    const setupPolling = useCallback(() => {
        console.log('Setting up polling for conversation:', conversationId);
        setIsConnected(true); // Consider polling as "connected"
        
        // Poll every 2 seconds for new messages
        pollingIntervalRef.current = setInterval(pollForMessages, 2000);
    }, [pollForMessages, conversationId]);

    // Send message function
    const sendMessage = useCallback(async (content) => {
        if (!content.trim() || !conversationId) return false;

        const apiUrl = `/${actualPrefix}/messages/${conversationId}/send`;
        console.log('📤 Sending message to:', apiUrl);

        try {
            const response = await axios.post(apiUrl, {
                content: content.trim()
            });

            // Check if response is successful
            if (response.data && response.data.status === 'success') {
                // Add the message to state immediately for better UX
                const newMessage = response.data.data.message;
                setMessages(prev => {
                    // Check if message already exists (to avoid duplicates from broadcast)
                    if (prev.some(msg => msg.id === newMessage.id)) {
                        return prev;
                    }
                    return [...prev, newMessage];
                });

                // Update last message time
                setLastMessageTime(newMessage.created_at);

                // Show success notification (optional, can be removed for less intrusive UX)
                // toast.success(response.data.message || 'Message sent successfully!');

                return true;
            } else {
                // Handle unexpected response format
                toast.error('Unexpected response from server');
                return false;
            }
        } catch (error) {
            console.error('Error sending message:', error.response?.data || error);

            if (error.response?.status === 422) {
                toast.error('Validation error: ' + (error.response.data.message || 'Invalid input'));
            } else if (error.response?.status === 403) {
                toast.error('Access denied');
            } else if (error.response?.status === 500) {
                toast.error(error.response.data.message || 'Server error occurred');
            } else {
                toast.error('Failed to send message: ' + (error.response?.data?.message || error.message));
            }
            return false;
        }
    }, [conversationId, actualPrefix]);

    // Send typing indicator
    const sendTypingIndicator = useCallback(async (isTyping = true) => {
        if (!conversationId) return;

        try {
            await axios.post(`/${actualPrefix}/messages/${conversationId}/typing`, {
                is_typing: isTyping
            });
        } catch (error) {
            console.error('Error sending typing indicator:', error);
        }
    }, [conversationId, actualPrefix]);

    // Mark messages as read
    const markAsRead = useCallback(async () => {
        if (!conversationId) return;

        try {
            await axios.post(`/${actualPrefix}/messages/${conversationId}/read`);
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    }, [conversationId, actualPrefix]);

    // Get typing indicator text
    const getTypingText = useCallback(() => {
        if (typingUsers.length === 0) return '';
        if (typingUsers.length === 1) {
            return `${typingUsers[0].first_name} is typing...`;
        }
        if (typingUsers.length === 2) {
            return `${typingUsers[0].first_name} and ${typingUsers[1].first_name} are typing...`;
        }
        return `${typingUsers[0].first_name} and ${typingUsers.length - 1} others are typing...`;
    }, [typingUsers]);

    // Initialize messages from props
    useEffect(() => {
        if (initialMessages && initialMessages.length > 0) {
            setMessages(initialMessages);
            if (initialMessages.length > 0) {
                setLastMessageTime(initialMessages[initialMessages.length - 1].created_at);
            }
        }
    }, [initialMessages]);

    return {
        messages,
        typingUsers,
        isConnected,
        unreadCount,
        sendMessage,
        sendTypingIndicator,
        markAsRead,
        getTypingText
    };
};

export default useRealtimeMessaging;