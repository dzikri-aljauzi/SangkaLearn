// Message notification utilities
export class MessageNotifications {
    constructor() {
        this.audio = null;
        this.permission = Notification.permission;
        this.initializeAudio();
    }

    initializeAudio() {
        // Create audio context for notification sounds
        try {
            this.audio = new Audio();
            // You can add a notification sound file here
            // this.audio.src = '/sounds/notification.mp3';
        } catch (error) {
            console.warn('Audio not supported:', error);
        }
    }

    async requestPermission() {
        if ('Notification' in window && this.permission === 'default') {
            this.permission = await Notification.requestPermission();
        }
        return this.permission;
    }

    playNotificationSound() {
        if (this.audio) {
            try {
                // Simple beep sound using Web Audio API
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = 800;
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.5);
            } catch (error) {
                console.warn('Could not play notification sound:', error);
            }
        }
    }

    showNotification(title, options = {}) {
        if (this.permission === 'granted') {
            const notification = new Notification(title, {
                icon: '/icon.png',
                badge: '/icon.png',
                tag: 'message-notification',
                renotify: true,
                requireInteraction: false,
                ...options
            });

            // Auto-close after 5 seconds
            setTimeout(() => {
                notification.close();
            }, 5000);

            return notification;
        }
    }

    showMessageNotification(message, senderName) {
        const title = `New message from ${senderName}`;
        const options = {
            body: message.length > 50 ? message.substring(0, 47) + '...' : message,
            icon: '/images/message-icon.png',
        };

        this.playNotificationSound();
        return this.showNotification(title, options);
    }

    // Check if user is currently focused on the tab
    isWindowFocused() {
        return document.hasFocus();
    }

    // Only show notifications when user is not focused on the window
    shouldShowNotification() {
        return !this.isWindowFocused() && this.permission === 'granted';
    }
}

// Singleton instance
export const messageNotifications = new MessageNotifications();
export default messageNotifications;