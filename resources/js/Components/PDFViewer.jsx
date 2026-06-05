import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, FileText, AlertCircle } from 'lucide-react';
// CSS imports handled globally via app.css or externally

// Configure PDF.js worker - use local worker file (no CORS issues)
pdfjs.GlobalWorkerOptions.workerSrc = '/js/pdf.worker.min.mjs';

/**
 * PDFViewer Component
 * Secure PDF viewer with download protection
 * Features: zoom, navigation, fullscreen, right-click disabled
 */
export default function PDFViewer({ pdfUrl, title = 'Document', className = '' }) {
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [containerWidth, setContainerWidth] = useState(null);

    // Memoize options to prevent unnecessary reloads
    const pdfOptions = useMemo(() => ({
        cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
        cMapPacked: true,
        standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
    }), []);

    // Disable right-click and keyboard shortcuts
    useEffect(() => {
        const preventContextMenu = (e) => {
            e.preventDefault();
            return false;
        };

        const preventKeyboard = (e) => {
            // Prevent Ctrl+S (save), Ctrl+P (print), F12 (devtools)
            if ((e.ctrlKey && (e.key === 's' || e.key === 'p')) || e.key === 'F12') {
                e.preventDefault();
                return false;
            }
        };

        document.addEventListener('contextmenu', preventContextMenu);
        document.addEventListener('keydown', preventKeyboard);

        return () => {
            document.removeEventListener('contextmenu', preventContextMenu);
            document.removeEventListener('keydown', preventKeyboard);
        };
    }, []);

    // Handle container resize
    useEffect(() => {
        const updateWidth = () => {
            const container = document.getElementById('pdf-container');
            if (container) {
                setContainerWidth(container.offsetWidth);
            }
        };

        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
        setLoading(false);
        setError(null);
    };

    const onDocumentLoadError = (error) => {
        console.error('Error loading PDF:', error);
        setError('Gagal memuat dokumen PDF. Silakan refresh halaman atau hubungi admin.');
        setLoading(false);
    };

    const goToPrevPage = () => {
        setPageNumber(prev => Math.max(prev - 1, 1));
    };

    const goToNextPage = () => {
        setPageNumber(prev => Math.min(prev + 1, numPages));
    };

    const zoomIn = () => {
        setScale(prev => Math.min(prev + 0.2, 3.0));
    };

    const zoomOut = () => {
        setScale(prev => Math.max(prev - 0.2, 0.5));
    };

    const toggleFullscreen = () => {
        const elem = document.getElementById('pdf-viewer-container');
        if (!document.fullscreenElement) {
            elem.requestFullscreen().then(() => {
                setIsFullscreen(true);
            }).catch((err) => {
                console.error('Error attempting to enable fullscreen:', err);
            });
        } else {
            document.exitFullscreen().then(() => {
                setIsFullscreen(false);
            });
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    if (error) {
        return (
            <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-8 ${className}`}>
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                        <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading PDF</h3>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div
            id="pdf-viewer-container"
            className={`bg-gray-50 rounded-xl border border-gray-200 overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : className}`}
        >
            {/* Toolbar */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-gray-900 truncate max-w-xs">
                        {title}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {/* Zoom Controls */}
                    <div className="flex items-center gap-1 border border-gray-300 rounded-lg bg-gray-50">
                        <button
                            onClick={zoomOut}
                            disabled={scale <= 0.5}
                            className="p-2 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-l-lg"
                            title="Zoom Out"
                        >
                            <ZoomOut className="w-4 h-4 text-gray-700" />
                        </button>
                        <span className="px-3 text-sm font-medium text-gray-700 min-w-[60px] text-center">
                            {Math.round(scale * 100)}%
                        </span>
                        <button
                            onClick={zoomIn}
                            disabled={scale >= 3.0}
                            className="p-2 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-r-lg"
                            title="Zoom In"
                        >
                            <ZoomIn className="w-4 h-4 text-gray-700" />
                        </button>
                    </div>

                    {/* Page Navigation */}
                    <div className="flex items-center gap-1 border border-gray-300 rounded-lg bg-gray-50">
                        <button
                            onClick={goToPrevPage}
                            disabled={pageNumber <= 1}
                            className="p-2 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-l-lg"
                            title="Previous Page"
                        >
                            <ChevronLeft className="w-4 h-4 text-gray-700" />
                        </button>
                        <span className="px-3 text-sm font-medium text-gray-700 min-w-[80px] text-center">
                            {pageNumber} / {numPages || '...'}
                        </span>
                        <button
                            onClick={goToNextPage}
                            disabled={pageNumber >= numPages}
                            className="p-2 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-r-lg"
                            title="Next Page"
                        >
                            <ChevronRight className="w-4 h-4 text-gray-700" />
                        </button>
                    </div>

                    {/* Fullscreen Toggle */}
                    <button
                        onClick={toggleFullscreen}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                        title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                    >
                        <Maximize2 className="w-4 h-4 text-gray-700" />
                    </button>
                </div>
            </div>

            {/* PDF Content */}
            <div
                id="pdf-container"
                className={`overflow-auto ${isFullscreen ? 'h-[calc(100vh-60px)]' : 'h-[600px]'} bg-gray-100`}
                style={{ userSelect: 'none' }}
            >
                <div className="flex flex-col items-center py-6">
                    {loading && (
                        <div className="flex flex-col items-center justify-center h-[500px]">
                            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                            <p className="text-gray-600 font-medium">Memuat dokumen...</p>
                        </div>
                    )}

                    <Document
                        file={pdfUrl}
                        onLoadSuccess={onDocumentLoadSuccess}
                        onLoadError={onDocumentLoadError}
                        loading=""
                        className="pdf-document"
                        options={pdfOptions}
                    >
                        <Page
                            pageNumber={pageNumber}
                            scale={scale}
                            width={containerWidth ? Math.min(containerWidth - 48, 800) : undefined}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                            className="shadow-lg mb-4"
                        />
                    </Document>
                </div>
            </div>

            {/* Protection Notice */}
            <div className="bg-amber-50 border-t border-amber-200 px-4 py-2">
                <p className="text-xs text-amber-800 text-center">
                    🔒 Dokumen ini dilindungi. Download dan print dinonaktifkan untuk melindungi konten.
                </p>
            </div>
        </div>
    );
}
