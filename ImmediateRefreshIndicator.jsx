import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle } from 'lucide-react';

/**
 * Visual indicator untuk immediate refresh
 * Menampilkan loading saat akan refresh dan success setelah refresh
 */
export default function ImmediateRefreshIndicator({ 
    message = "Refreshing...",
    countdown = 3,
    onComplete = null,
    className = ""
}) {
    const [timeLeft, setTimeLeft] = useState(countdown);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => {
                setTimeLeft(timeLeft - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else {
            setIsRefreshing(true);
            if (onComplete) {
                setTimeout(onComplete, 500);
            }
        }
    }, [timeLeft, onComplete]);

    return (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className}`}>
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm mx-4 text-center">
                <div className="mb-4">
                    {isRefreshing ? (
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto animate-pulse" />
                    ) : (
                        <RefreshCw className="w-12 h-12 text-blue-500 mx-auto animate-spin" />
                    )}
                </div>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {isRefreshing ? "Sedang Mempersiapkan..." : "Mempersiapkan Sesi Anda"}
                </h3>
                
                <p className="text-gray-600 mb-4">
                    {message}
                </p>
                
                {!isRefreshing && (
                    <div className="text-2xl font-bold text-blue-600">
                        {timeLeft}
                    </div>
                )}
                
                {isRefreshing && (
                    <div className="text-sm text-green-600 animate-pulse">
                        ✨ Mempersiapkan sesi login Anda...
                    </div>
                )}
            </div>
        </div>
    );
}