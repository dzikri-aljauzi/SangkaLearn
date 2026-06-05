import React, { useState, useRef, useEffect } from 'react';
import { XMarkIcon, PaperAirplaneIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ChatbotWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'bot',
            text: 'Halo! Salam kenal, saya LENA virtual asisten anda dari LeadNex By LNA. Ada yang bisa saya bantu?',
            timestamp: new Date()
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const sendMessage = async (e) => {
        e.preventDefault();

        if (!inputMessage.trim() || isLoading) return;
        const userMessageText = inputMessage.trim();
        const userMessage = {
            id: Date.now(),
            type: 'user',
            text: userMessageText,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            console.log('Sending message to chatbot:', userMessageText);

            const response = await fetch('/api/chatbot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({
                    input_prompt: userMessageText
                })
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            const data = await response.json();
            console.log('Response data:', data);

            let botResponseText = '';

            if (response.ok && data.result) {
                botResponseText = data.result;
            } else if (data.response) {
                botResponseText = data.response;
            } else if (data.bot_response) {
                botResponseText = data.bot_response;
            } else if (data.message) {
                botResponseText = data.message;
            } else if (data.detail) {
                botResponseText = 'Maaf, saya sedang mengalami gangguan. Silakan coba lagi nanti atau hubungi admin untuk bantuan lebih lanjut.';
            } else {
                botResponseText = 'Maaf, saya tidak dapat memproses permintaan Anda saat ini.';
            }

            const formattedResponse = `${botResponseText}`;

            const botMessage = {
                id: Date.now() + 1,
                type: 'bot',
                text: formattedResponse,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
            console.error('Error details:', error.message);
            console.error('Error type:', error.name);

            let errorText = 'Maaf, terjadi kesalahan dalam menghubungi server.';

            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                errorText = 'Maaf, tidak dapat terhubung ke server chatbot. Kemungkinan ada masalah CORS atau jaringan. Error: ' + error.message;
            } else if (error instanceof SyntaxError) {
                errorText = 'Maaf, terjadi kesalahan dalam membaca respon dari server.';
            } else {
                errorText = 'Maaf, terjadi kesalahan: ' + error.message;
            }

            const errorMessage = {
                id: Date.now() + 1,
                type: 'bot',
                text: errorText,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    };

    const toggleChat = () => {
        if (!isOpen) {
            // Reset conversation when opening chat
            setMessages([
                {
                    id: 1,
                    type: 'bot',
                    text: 'Halo! Saya Lena (LeadNex by LNA). Ada yang bisa saya bantu?',
                    timestamp: new Date()
                }
            ]);
        }
        setIsOpen(!isOpen);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Chat Button */}
            {!isOpen && (
                <button
                    onClick={toggleChat}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300"
                    aria-label="Open chat"
                >
                    <ChatBubbleLeftRightIcon className="h-6 w-6" />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="bg-white rounded-lg shadow-2xl w-[450px] max-w-[calc(100vw-3rem)] flex flex-col" style={{ height: '700px', maxHeight: 'calc(100vh - 8rem)' }}>
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="bg-white/20 rounded-full p-2">
                                <img
                                    src="/images/avatar.jpeg"
                                    alt="Lena Avatar"
                                    className="h-8 w-8 rounded-full object-cover"
                                />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Lena</h3>
                                <p className="text-xs text-blue-100">Chatbot AI LeadNex by LNA</p>
                            </div>
                        </div>
                        <button
                            onClick={toggleChat}
                            className="hover:bg-white/10 rounded-full p-2 transition-colors"
                            aria-label="Close chat"
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Messages Container */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                                        message.type === 'user'
                                            ? 'bg-blue-600 text-white rounded-br-none'
                                            : 'bg-white text-gray-800 shadow-sm rounded-bl-none border border-gray-200'
                                    }`}
                                >
                                    {message.type === 'user' ? (
                                        <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                                    ) : (
                                        <div className="text-sm prose prose-sm max-w-none prose-headings:text-gray-800 prose-p:text-gray-700 prose-p:my-2 prose-strong:text-gray-900 prose-strong:font-semibold prose-ul:my-2 prose-ol:my-2 prose-li:text-gray-700 prose-li:my-1 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {message.text}
                                            </ReactMarkdown>
                                        </div>
                                    )}
                                    <span
                                        className={`text-xs mt-1 block ${
                                            message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                                        }`}
                                    >
                                        {formatTime(message.timestamp)}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white text-gray-800 shadow-sm rounded-lg rounded-bl-none px-4 py-3 border border-gray-200">
                                    <div className="flex space-x-2">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Form */}
                    <div className="p-4 bg-white border-t border-gray-200 rounded-b-lg">
                        <form onSubmit={sendMessage} className="flex space-x-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder="Ketik pesan Anda..."
                                disabled={isLoading}
                                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !inputMessage.trim()}
                                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
                                aria-label="Send message"
                            >
                                <PaperAirplaneIcon className="h-5 w-5" />
                            </button>
                        </form>
                        <p className="text-xs text-gray-500 mt-2 text-center">
                            Powered by Lena - LeadNex AI
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatbotWidget;
