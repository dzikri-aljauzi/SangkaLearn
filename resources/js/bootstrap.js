import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Set up CSRF token
const token = document.head.querySelector('meta[name="csrf-token"]');
if (token) {
    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
} else {
    console.error('CSRF token not found');
}

// Disable Laravel Echo for now to prevent Vite build issues
// Uncomment when WebSocket functionality is needed
/*
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

try {
    window.Pusher = Pusher;
    window.Echo = new Echo({
        broadcaster: 'pusher',
        key: process.env.MIX_PUSHER_APP_KEY || 'local-key',
        cluster: process.env.MIX_PUSHER_APP_CLUSTER || 'local',
        forceTLS: false,
    });
    console.log('Laravel Echo initialized successfully');
} catch (error) {
    console.warn('WebSocket not available:', error.message);
    window.Echo = null;
}
*/

// For now, just set Echo to null to prevent errors
window.Echo = null;
