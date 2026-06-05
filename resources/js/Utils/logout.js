import { router } from '@inertiajs/react';

export const handleLogout = () => {
    // Get the current CSRF token from meta tag
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    
    if (!token) {
        // If no token, just redirect to home
        window.location.href = '/';
        return;
    }
    
    // Use Inertia to make the logout request with proper CSRF handling
    router.post('/logout', {}, {
        preserveScroll: false,
        preserveState: false,
        replace: true,
        onSuccess: () => {
            // Redirect to home on success
            window.location.href = '/';
        },
        onError: (errors) => {
            // If 419 error or any other error, just redirect to home
            window.location.href = '/';
        },
        onFinish: () => {
            // Always redirect to home when finished
            setTimeout(() => {
                if (window.location.pathname !== '/') {
                    window.location.href = '/';
                }
            }, 500);
        }
    });
};