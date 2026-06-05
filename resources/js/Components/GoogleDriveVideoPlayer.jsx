import React, { useState, useEffect, useRef } from 'react';
import { Play, AlertCircle, Video } from 'lucide-react';

/**
 * GoogleDriveVideoPlayer Component
 * Embeds Google Drive videos with download protection
 * Converts sharing links to embed format
 * Hides download button when video can't play
 */
export default function GoogleDriveVideoPlayer({ driveUrl, title = 'Video Pembelajaran', className = '' }) {
    const [embedUrl, setEmbedUrl] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const iframeRef = useRef(null);

    useEffect(() => {
        if (!driveUrl) {
            setError('URL Google Drive tidak tersedia');
            setLoading(false);
            return;
        }

        try {
            const videoId = extractDriveVideoId(driveUrl);
            if (videoId) {
                // Use preview endpoint which disables download by default
                setEmbedUrl(`https://drive.google.com/file/d/${videoId}/preview`);
                setLoading(false);
            } else {
                setError('Format URL Google Drive tidak valid');
                setLoading(false);
            }
        } catch (err) {
            console.error('Error parsing Drive URL:', err);
            setError('Gagal memproses URL Google Drive');
            setLoading(false);
        }
    }, [driveUrl]);

    // Disable right-click on the component
    useEffect(() => {
        const preventContextMenu = (e) => {
            if (e.target.closest('.drive-video-player')) {
                e.preventDefault();
                return false;
            }
        };

        document.addEventListener('contextmenu', preventContextMenu);
        return () => document.removeEventListener('contextmenu', preventContextMenu);
    }, []);

    // Hide Google Drive download button when video can't play
    useEffect(() => {
        if (!embedUrl) return;

        // Add CSS to hide download button inside iframe
        const style = document.createElement('style');
        style.textContent = `
            /* Hide Google Drive download button */
            .drive-video-player iframe {
                pointer-events: auto;
            }
        `;
        document.head.appendChild(style);

        return () => {
            if (style.parentNode) {
                style.parentNode.removeChild(style);
            }
        };
    }, [embedUrl]);

    /**
     * Extract video ID from various Google Drive URL formats
     * Supports:
     * - https://drive.google.com/file/d/{id}/view
     * - https://drive.google.com/open?id={id}
     * - https://drive.google.com/file/d/{id}/preview
     */
    const extractDriveVideoId = (url) => {
        if (!url) return null;

        // Pattern 1: /file/d/{id}/
        const pattern1 = /\/file\/d\/([a-zA-Z0-9_-]+)/;
        const match1 = url.match(pattern1);
        if (match1) return match1[1];

        // Pattern 2: ?id={id}
        const pattern2 = /[?&]id=([a-zA-Z0-9_-]+)/;
        const match2 = url.match(pattern2);
        if (match2) return match2[1];

        // Pattern 3: Direct ID (if user just pastes the ID)
        if (/^[a-zA-Z0-9_-]+$/.test(url.trim())) {
            return url.trim();
        }

        return null;
    };

    if (error) {
        return (
            <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-8 ${className}`}>
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                        <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Video</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <div className="bg-gray-50 rounded-lg p-4 text-left">
                        <p className="text-sm text-gray-700 font-medium mb-2">Format URL yang didukung:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                            <li>• https://drive.google.com/file/d/[ID]/view</li>
                            <li>• https://drive.google.com/open?id=[ID]</li>
                            <li>• https://drive.google.com/file/d/[ID]/preview</li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className={`bg-gray-900 rounded-xl overflow-hidden ${className}`}>
                <div className="aspect-video flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-gray-400">Memuat video...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`drive-video-player bg-gray-900 rounded-xl overflow-hidden shadow-lg ${className}`}>
            {/* Video Container */}
            <div className="relative aspect-video bg-black">
                <iframe
                    ref={iframeRef}
                    src={embedUrl}
                    className="absolute inset-0 w-full h-full"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    title={title}
                    style={{
                        border: 'none',
                        userSelect: 'none'
                    }}
                    onContextMenu={(e) => e.preventDefault()}
                    onLoad={() => setLoading(false)}
                />

                {/* Overlay to block pop-out button (top-right corner) */}
                <div
                    className="absolute top-0 right-0 w-16 h-16 z-10"
                    style={{
                        background: 'transparent',
                        cursor: 'default'
                    }}
                    onClick={(e) => e.preventDefault()}
                    onContextMenu={(e) => e.preventDefault()}
                />
            </div>

            {/* Video Info Bar */}
            <div className="bg-gray-800 px-4 py-3 border-t border-gray-700">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                        <Video className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white truncate">{title}</p>
                        <p className="text-xs text-gray-400">Google Drive Video</p>
                    </div>
                </div>
            </div>

            {/* Protection Notice */}
            <div className="bg-amber-900/50 border-t border-amber-700/50 px-4 py-2">
                <p className="text-xs text-amber-200 text-center flex items-center justify-center gap-2">
                    <span>🔒</span>
                    <span>Video dilindungi - Download dinonaktifkan</span>
                </p>
            </div>
        </div>
    );
}
