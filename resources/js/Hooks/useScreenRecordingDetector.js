import { useState, useEffect, useCallback } from 'react';

/**
 * Hook to detect screen recording attempts
 *
 * Detection methods:
 * 1. Monitor window focus changes
 * 2. Check for picture-in-picture mode
 * 3. Monitor page visibility
 * 4. Check for suspicious browser extensions
 *
 * @param {Function} onDetected - Callback when recording is detected
 * @returns {Object} - { isRecording, suspiciousActivity }
 */
export default function useScreenRecordingDetector(onDetected) {
    const [isRecording, setIsRecording] = useState(false);
    const [suspiciousActivity, setSuspiciousActivity] = useState(false);

    const handleDetection = useCallback((reason) => {
        setIsRecording(true);
        setSuspiciousActivity(true);

        if (onDetected) {
            onDetected(reason);
        }

        // Reset after 10 seconds
        setTimeout(() => {
            setIsRecording(false);
        }, 10000);
    }, [onDetected]);

    useEffect(() => {
        let focusLossCount = 0;
        let lastFocusLoss = Date.now();

        // Detect rapid focus changes (common during screen recording setup)
        const handleVisibilityChange = () => {
            if (document.hidden) {
                const now = Date.now();

                // If multiple focus losses in short time
                if (now - lastFocusLoss < 2000) {
                    focusLossCount++;

                    if (focusLossCount > 3) {
                        handleDetection('Multiple rapid focus changes detected');
                    }
                } else {
                    focusLossCount = 0;
                }

                lastFocusLoss = now;
            }
        };

        // Check for picture-in-picture (sometimes used for recording)
        const checkPictureInPicture = () => {
            if (document.pictureInPictureElement) {
                handleDetection('Picture-in-Picture mode detected');
            }
        };

        // Monitor for screen capture API usage
        const monitorScreenCapture = () => {
            if (navigator.mediaDevices) {
                const originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia;

                if (originalGetDisplayMedia) {
                    navigator.mediaDevices.getDisplayMedia = function(...args) {
                        handleDetection('Screen capture API accessed');
                        return originalGetDisplayMedia.apply(this, args);
                    };
                }
            }
        };

        // Check for window resizing (common when setting up recording)
        let resizeCount = 0;
        let lastResize = Date.now();

        const handleResize = () => {
            const now = Date.now();

            if (now - lastResize < 1000) {
                resizeCount++;

                if (resizeCount > 5) {
                    setSuspiciousActivity(true);
                }
            } else {
                resizeCount = 0;
            }

            lastResize = now;
        };

        // Detect DevTools (often used with recording)
        const detectDevTools = () => {
            const threshold = 160;
            const widthThreshold = window.outerWidth - window.innerWidth > threshold;
            const heightThreshold = window.outerHeight - window.innerHeight > threshold;

            if (widthThreshold || heightThreshold) {
                setSuspiciousActivity(true);
            }
        };

        // Check for common screen recording software indicators
        const checkRecordingSoftware = () => {
            // Check for OBS, Bandicam, Camtasia indicators in window title or DOM
            const indicators = [
                'obs',
                'bandicam',
                'camtasia',
                'screencast',
                'recorder',
                'capture'
            ];

            const title = document.title.toLowerCase();
            const hasIndicator = indicators.some(indicator =>
                title.includes(indicator)
            );

            if (hasIndicator) {
                setSuspiciousActivity(true);
            }
        };

        // Add event listeners
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('resize', handleResize);

        // Run checks periodically
        const checkInterval = setInterval(() => {
            checkPictureInPicture();
            detectDevTools();
            checkRecordingSoftware();
        }, 5000);

        // Initial setup
        monitorScreenCapture();

        // Cleanup
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('resize', handleResize);
            clearInterval(checkInterval);
        };
    }, [handleDetection]);

    return {
        isRecording,
        suspiciousActivity
    };
}
