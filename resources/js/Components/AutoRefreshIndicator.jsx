import React, { useState, useEffect } from 'react';
import { RefreshCw, Clock, Pause, Play } from 'lucide-react';

/**
 * Visual indicator untuk menunjukkan status auto refresh
 * Menampilkan countdown timer dan kontrol manual
 */
export default function AutoRefreshIndicator({ 
    interval = 10 * 60 * 1000, // 10 menit default
    enabled = true,
    onRefresh = null,
    onToggle = null,
    className = ""
}) {
    const [timeLeft, setTimeLeft] = useState(interval);
    const [isActive, setIsActive] = useState(enabled);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        let timer = null;

        if (isActive && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1000) {
                        // Time to refresh
                        setIsRefreshing(true);
                        if (onRefresh) {
                            onRefresh();
                        }
                        setTimeout(() => {
                            setIsRefreshing(false);
                        }, 2000);
                        return interval; // Reset timer
                    }
                    return prev - 1000;
                });
            }, 1000);
        }

        return () => {
            if (timer) clearInterval(timer);
        };
    }, [isActive, timeLeft, interval, onRefresh]);

    const formatTime = (ms) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const toggleRefresh = () => {
        const newState = !isActive;
        setIsActive(newState);
        if (onToggle) {
            onToggle(newState);
        }
        if (newState) {
            setTimeLeft(interval);
        }
    };

    const forceRefresh = () => {
        setIsRefreshing(true);
        setTimeLeft(interval);
        if (onRefresh) {
            onRefresh();
        }
        setTimeout(() => {
            setIsRefreshing(false);
        }, 2000);
    };

    return (
        <div className={`fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-3 min-w-[200px] z-50 ${className}`}>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                    <span className="text-sm font-medium text-gray-700">
                        Auto Refresh
                    </span>
                </div>
                <button
                    onClick={toggleRefresh}
                    className={`p-1 rounded transition-colors ${isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'}`}
                    title={isActive ? 'Pause auto refresh' : 'Resume auto refresh'}
                >
                    {isActive ? <Pause size={14} /> : <Play size={14} />}
                </button>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Clock size={14} className="text-gray-500" />
                    <span className={`text-sm font-mono ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                        {isActive ? formatTime(timeLeft) : '--:--'}
                    </span>
                </div>
                <button
                    onClick={forceRefresh}
                    disabled={isRefreshing}
                    className={`p-1 rounded transition-all ${isRefreshing ? 'text-blue-600 animate-spin' : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'}`}
                    title="Refresh now"
                >
                    <RefreshCw size={14} />
                </button>
            </div>

            {isRefreshing && (
                <div className="mt-2 text-xs text-blue-600 animate-pulse">
                    🔄 Refreshing page...
                </div>
            )}

            <div className="mt-2 text-xs text-gray-500">
                Next refresh: {formatTime(timeLeft)}
            </div>
        </div>
    );
}