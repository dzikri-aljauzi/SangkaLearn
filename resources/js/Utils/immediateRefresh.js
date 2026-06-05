/**
 * Immediate Refresh Utility
 * Untuk refresh langsung saat masuk halaman tertentu
 */

export const immediateRefresh = (delay = 500) => {
    console.log(`🔄 Immediate refresh akan dilakukan dalam ${delay}ms...`);
    
    // Simpan scroll position sebelum refresh
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    sessionStorage.setItem('scrollPosition', scrollPosition);
    
    // Tambahkan flag bahwa ini adalah immediate refresh
    sessionStorage.setItem('isImmediateRefresh', 'true');
    
    setTimeout(() => {
        console.log('🔄 Executing immediate refresh...');
        window.location.reload();
    }, delay);
};

export const immediateRefreshWithMessage = (message, delay = 1000) => {
    console.log(`🔄 ${message} - refresh dalam ${delay}ms...`);
    
    // Simpan scroll position
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    sessionStorage.setItem('scrollPosition', scrollPosition);
    sessionStorage.setItem('isImmediateRefresh', 'true');
    sessionStorage.setItem('refreshMessage', message);
    
    setTimeout(() => {
        console.log(`🔄 ${message} - executing refresh...`);
        window.location.reload();
    }, delay);
};

export const restoreAfterRefresh = () => {
    const isImmediateRefresh = sessionStorage.getItem('isImmediateRefresh');
    const refreshMessage = sessionStorage.getItem('refreshMessage');
    const scrollPosition = sessionStorage.getItem('scrollPosition');
    
    if (isImmediateRefresh === 'true') {
        console.log('✅ Immediate refresh completed');
        
        if (refreshMessage) {
            console.log(`✅ ${refreshMessage} - completed`);
            sessionStorage.removeItem('refreshMessage');
        }
        
        // Restore scroll position
        if (scrollPosition) {
            setTimeout(() => {
                window.scrollTo(0, parseInt(scrollPosition));
                sessionStorage.removeItem('scrollPosition');
            }, 100);
        }
        
        // Clear immediate refresh flag
        sessionStorage.removeItem('isImmediateRefresh');
        
        return true;
    }
    
    return false;
};

export const shouldSkipNormalRefresh = () => {
    return sessionStorage.getItem('isImmediateRefresh') === 'true';
};

// Check if this is page load after immediate refresh
export const isAfterImmediateRefresh = () => {
    return sessionStorage.getItem('isImmediateRefresh') === 'true';
};