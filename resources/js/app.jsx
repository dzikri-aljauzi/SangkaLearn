import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import ErrorHandler from './Components/ErrorHandler';

const appName = import.meta.env.VITE_APP_NAME || 'SangkaLearn';

// Global CSRF token management
let isRefreshingToken = false;
let refreshPromise = null;

const refreshCSRFToken = () => {
    if (isRefreshingToken && refreshPromise) {
        return refreshPromise;
    }
    
    isRefreshingToken = true;
    refreshPromise = fetch('/csrf-token', {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'same-origin'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        if (data && data.csrf_token) {
            // Update meta tag
            const metaTag = document.querySelector('meta[name="csrf-token"]');
            if (metaTag) {
                metaTag.setAttribute('content', data.csrf_token);
            }
            
            // Update axios defaults if available
            if (window.axios) {
                window.axios.defaults.headers.common['X-CSRF-TOKEN'] = data.csrf_token;
            }
            
            return data.csrf_token;
        }
        throw new Error('No valid token received');
    })
    .catch(error => {
        console.warn('CSRF token refresh failed:', error);
        throw error;
    })
    .finally(() => {
        isRefreshingToken = false;
        refreshPromise = null;
    });
    
    return refreshPromise;
};

// Make refreshCSRFToken available globally
window.refreshCSRFToken = refreshCSRFToken;

// Handle CSRF token expiration (419 errors) more elegantly
router.on('error', (event) => {
    if (event.detail.status === 419) {
        const currentUrl = window.location.pathname;
        
        // Prevent showing error to user, handle silently
        event.preventDefault?.();
        
        // Special handling for logout requests
        if (currentUrl.includes('/logout') || event.detail.url?.includes('/logout')) {
            // For logout, just redirect to home page
            window.location.href = '/';
            return;
        }
        
        refreshCSRFToken()
            .then(() => {
                // Retry the original request with the new token
                const originalRequest = event.detail;
                if (originalRequest && originalRequest.url) {
                    // Use router.visit to retry the request properly
                    setTimeout(() => {
                        router.visit(originalRequest.url, {
                            method: originalRequest.method || 'get',
                            data: originalRequest.data || {},
                            preserveScroll: true,
                            preserveState: true,
                            replace: true
                        });
                    }, 100);
                } else {
                    // Fallback: refresh the current page
                    window.location.reload();
                }
            })
            .catch(() => {
                // If token refresh fails completely, redirect to login
                router.visit('/login', { replace: true });
            });
    }
});

// Refresh CSRF token periodically (every 2 hours)
const tokenRefreshInterval = setInterval(() => {
    refreshCSRFToken().catch(() => {
        // If periodic refresh fails, clear the interval to avoid spam
        clearInterval(tokenRefreshInterval);
    });
}, 2 * 60 * 60 * 1000); // 2 hours

// Refresh token before page unload for better UX on return
window.addEventListener('beforeunload', () => {
    // Quick token refresh attempt (non-blocking)
    refreshCSRFToken().catch(() => {});
});

// Refresh token on page visibility change (when user returns to tab)
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        refreshCSRFToken().catch(() => {});
        
        // Juga restart auto refresh jika halaman kembali visible
        const autoRefreshModule = import('@/Utils/autoRefresh');
        autoRefreshModule.then(({ autoRefresh }) => {
            if (autoRefresh.enabled) {
                autoRefresh.lastActivity = Date.now(); // Update last activity
            }
        });
    }
});

// Global notification untuk auto refresh
window.addEventListener('beforeunload', () => {
    // Stop auto refresh sebelum page unload
    const autoRefreshModule = import('@/Utils/autoRefresh');
    autoRefreshModule.then(({ stopAutoRefresh }) => {
        stopAutoRefresh();
    });
});

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {

        const root = createRoot(el);

        root.render(
            <ErrorHandler>
                <App {...props} />
            </ErrorHandler>
        );
    },
    progress: {
        color: '#565C59',
    },
});
