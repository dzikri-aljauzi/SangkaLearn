/**
 * Auto Refresh Utility untuk mencegah 419 CSRF Token Expired
 * Akan melakukan refresh halaman secara berkala untuk memperbarui token
 */

class AutoRefresh {
    constructor(options = {}) {
        this.interval = options.interval || 10 * 60 * 1000; // Default 10 menit
        this.enabled = options.enabled || true;
        this.refreshTimer = null;
        this.inactivityTimer = null;
        this.lastActivity = Date.now();
        this.maxInactivity = options.maxInactivity || 20 * 60 * 1000; // 20 menit tanpa aktivitas
        
        // Bind methods
        this.handleActivity = this.handleActivity.bind(this);
        this.refresh = this.refresh.bind(this);
        this.checkInactivity = this.checkInactivity.bind(this);
    }

    start() {
        if (!this.enabled) return;
        
        console.log('🔄 Auto refresh started - interval:', this.interval / 1000 / 60, 'minutes');
        
        // Set timer untuk refresh berkala
        this.refreshTimer = setInterval(() => {
            this.refresh();
        }, this.interval);

        // Track user activity
        this.trackActivity();
        
        // Check inactivity every minute
        this.inactivityTimer = setInterval(() => {
            this.checkInactivity();
        }, 60 * 1000);
    }

    stop() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
        
        if (this.inactivityTimer) {
            clearInterval(this.inactivityTimer);
            this.inactivityTimer = null;
        }
        
        this.stopTrackingActivity();
        console.log('⏹️ Auto refresh stopped');
    }

    refresh() {
        const currentTime = Date.now();
        const timeSinceLastActivity = currentTime - this.lastActivity;
        
        // Jangan refresh jika user tidak aktif lebih dari maxInactivity
        if (timeSinceLastActivity > this.maxInactivity) {
            console.log('⏸️ Skipping refresh - user inactive for', Math.round(timeSinceLastActivity / 1000 / 60), 'minutes');
            return;
        }

        console.log('🔄 Auto refreshing page to prevent CSRF token expiration...');
        
        // Simpan scroll position
        const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
        sessionStorage.setItem('scrollPosition', scrollPosition);
        
        // Refresh halaman
        window.location.reload();
    }

    trackActivity() {
        // Event listeners untuk track user activity
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        
        events.forEach(event => {
            document.addEventListener(event, this.handleActivity, true);
        });
    }

    stopTrackingActivity() {
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        
        events.forEach(event => {
            document.removeEventListener(event, this.handleActivity, true);
        });
    }

    handleActivity() {
        this.lastActivity = Date.now();
    }

    checkInactivity() {
        const currentTime = Date.now();
        const timeSinceLastActivity = currentTime - this.lastActivity;
        
        if (timeSinceLastActivity > this.maxInactivity) {
            console.log('💤 User inactive for', Math.round(timeSinceLastActivity / 1000 / 60), 'minutes');
        }
    }

    // Method untuk restore scroll position setelah refresh
    restoreScrollPosition() {
        const scrollPosition = sessionStorage.getItem('scrollPosition');
        if (scrollPosition) {
            window.scrollTo(0, parseInt(scrollPosition));
            sessionStorage.removeItem('scrollPosition');
        }
    }
}

// Export instance yang bisa digunakan globally
export const autoRefresh = new AutoRefresh();

// Helper functions
export const startAutoRefresh = (options = {}) => {
    autoRefresh.stop(); // Stop existing timer
    Object.assign(autoRefresh, options);
    autoRefresh.start();
};

export const stopAutoRefresh = () => {
    autoRefresh.stop();
};

export const restoreScrollPosition = () => {
    autoRefresh.restoreScrollPosition();
};

// Configuration presets
export const REFRESH_CONFIGS = {
    LOGIN_PAGE: {
        interval: 8 * 60 * 1000, // 8 menit untuk halaman login
        maxInactivity: 15 * 60 * 1000, // 15 menit max inactivity
        enabled: true
    },
    DASHBOARD: {
        interval: 15 * 60 * 1000, // 15 menit untuk dashboard
        maxInactivity: 30 * 60 * 1000, // 30 menit max inactivity
        enabled: true
    },
    AUTHENTICATED_PAGES: {
        interval: 12 * 60 * 1000, // 12 menit untuk halaman authenticated
        maxInactivity: 25 * 60 * 1000, // 25 menit max inactivity
        enabled: true
    }
};