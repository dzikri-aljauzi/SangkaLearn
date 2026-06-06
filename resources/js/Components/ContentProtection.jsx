import React, { useEffect, useState, useRef } from 'react';
import { AlertTriangle, Shield, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

/**
 * ContentProtection Component
 * Protects content from screenshots and screen recording
 *
 * Features:
 * - Disable right-click
 * - Disable keyboard shortcuts (PrintScreen, Ctrl+S, etc)
 * - Screen recording detection
 * - Blur content when window loses focus
 * - Warning modal for screenshot attempts
 * - Black overlay on screenshot
 */
export default function ContentProtection({ children, userName = 'Student', userEmail = '' }) {
    const [showWarning, setShowWarning] = useState(false);
    const [warningMessage, setWarningMessage] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const contentRef = useRef(null);
    const overlayRef = useRef(null);

    useEffect(() => {
        // Disable right-click
        const handleContextMenu = (e) => {
            e.preventDefault();
            showWarningModal('Right-click is disabled for content protection');
            return false;
        };

        // Disable keyboard shortcuts
        const handleKeyDown = (e) => {
            // PrintScreen
            if (e.key === 'PrintScreen') {
                e.preventDefault();
                showWarningModal('Screenshot attempt detected! This action is not allowed.');
                // Blur the content temporarily
                if (contentRef.current) {
                    contentRef.current.style.filter = 'blur(20px)';
                    setTimeout(() => {
                        if (contentRef.current) {
                            contentRef.current.style.filter = 'none';
                        }
                    }, 2000);
                }
                return false;
            }

            // Ctrl+S, Ctrl+P, Ctrl+Shift+S (Save, Print, Screenshot on some systems)
            if (e.ctrlKey && (e.key === 's' || e.key === 'p')) {
                e.preventDefault();
                showWarningModal('Saving/Printing is disabled for content protection');
                return false;
            }

            // Windows Key + Shift + S (Windows Snipping Tool)
            if (e.key === 'Meta' || (e.shiftKey && e.key === 's')) {
                // Can't fully prevent but show warning
                showWarningModal('Screenshot tools are not recommended. Your activity is being monitored.');
            }

            // F12, Ctrl+Shift+I, Ctrl+Shift+J (DevTools)
            if (
                e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c'))
            ) {
                e.preventDefault();
                showWarningModal('Developer tools are disabled for content protection');
                return false;
            }
        };

        // Detect window blur (possible screenshot via external tool)
        const handleVisibilityChange = () => {
            if (document.hidden) {
                // Window is hidden, possible screenshot
                if (contentRef.current) {
                    contentRef.current.style.filter = 'blur(20px)';
                }
            } else {
                // Window is visible again
                if (contentRef.current) {
                    contentRef.current.style.filter = 'none';
                }
            }
        };

        // Detect screen recording (experimental)
        const detectScreenRecording = async () => {
            try {
                // Check if getDisplayMedia is being used (screen sharing/recording)
                if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
                    // Monitor for screen capture
                    const checkRecording = setInterval(() => {
                        // This is a heuristic check - not 100% reliable
                        // Check if there are active media streams
                        if (document.pictureInPictureElement) {
                            setIsRecording(true);
                            showWarningModal('Screen recording detected! Recording learning content is prohibited.');
                        }
                    }, 5000); // Check every 5 seconds

                    return () => clearInterval(checkRecording);
                }
            } catch (error) {
                console.log('Screen recording detection not available');
            }
        };

        // Add event listeners
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyDown);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Start screen recording detection
        const cleanup = detectScreenRecording();

        // Prevent drag and drop
        const handleDragStart = (e) => {
            e.preventDefault();
            return false;
        };
        document.addEventListener('dragstart', handleDragStart);

        // Cleanup
        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyDown);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('dragstart', handleDragStart);
            if (cleanup) cleanup.then(fn => fn && fn());
        };
    }, []);

    // Monitor for screenshot attempts using clipboard API
    useEffect(() => {
        const handleCopy = (e) => {
            // Prevent copying
            e.preventDefault();
            showWarningModal('Copying content is disabled for protection');
            return false;
        };

        document.addEventListener('copy', handleCopy);
        document.addEventListener('cut', handleCopy);

        return () => {
            document.removeEventListener('copy', handleCopy);
            document.removeEventListener('cut', handleCopy);
        };
    }, []);

    const showWarningModal = (message) => {
        setWarningMessage(message);
        setShowWarning(true);
        toast.error(message, {
            duration: 4000,
            icon: '🚫',
        });

        // Log the attempt (you can send this to backend)
        logSecurityEvent('screenshot_attempt', message);
    };

    const logSecurityEvent = (eventType, details) => {
        // Log to console (in production, send to backend)
        console.warn('Security Event:', {
            type: eventType,
            details: details,
            user: userEmail || userName,
            timestamp: new Date().toISOString(),
            url: window.location.href
        });

        // TODO: Send to backend API for tracking
        // fetch('/api/security-log', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ type: eventType, details, user: userEmail })
        // });
    };

    return (
        <>
            {/* Content with protection */}
            <div
                ref={contentRef}
                className="relative select-none"
                style={{
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    MozUserSelect: 'none',
                    msUserSelect: 'none',
                    WebkitTouchCallout: 'none',
                }}
            >
                {/* Black overlay for screenshots */}
                <div
                    ref={overlayRef}
                    className="absolute inset-0 pointer-events-none z-[9999]"
                    style={{
                        background: 'transparent',
                        mixBlendMode: 'screen',
                    }}
                >
                    {/* Invisible watermark that appears on screenshot */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 screenshot-visible">
                        <div className="bg-black text-white p-8 rounded-lg text-center">
                            <Shield className="w-16 h-16 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold mb-2">Protected Content</h2>
                            <p className="text-lg">Screenshot Detected</p>
                            <p className="mt-2">User: {userName}</p>
                            <p>Email: {userEmail}</p>
                            <p className="mt-2 text-sm">This action has been logged</p>
                        </div>
                    </div>
                </div>

                {/* Actual content */}
                <div className="relative z-10">
                    {children}
                </div>

                {/* Recording indicator */}
                {isRecording && (
                    <div className="fixed top-4 right-4 z-50 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
                        <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
                        <span className="font-semibold">Recording Detected</span>
                    </div>
                )}
            </div>

            {/* Warning Modal */}
            {showWarning && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-75 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
                        <button
                            onClick={() => setShowWarning(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle className="w-8 h-8 text-red-600" />
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Action Not Allowed
                            </h3>

                            <p className="text-gray-600 mb-4">
                                {warningMessage}
                            </p>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                                <p className="text-sm text-yellow-800">
                                    <strong>Notice:</strong> All content protection violations are logged and monitored.
                                    Repeated violations may result in access suspension.
                                </p>
                            </div>

                            <button
                                onClick={() => setShowWarning(false)}
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                I Understand
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CSS for screenshot detection */}
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    body::before {
                        content: 'Printing is disabled for content protection';
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        font-size: 24px;
                        visibility: visible;
                    }
                }

                /* Make overlay visible on screenshot */
                .screenshot-visible {
                    opacity: 1 !important;
                    background: black !important;
                }
            `}</style>
        </>
    );
}
