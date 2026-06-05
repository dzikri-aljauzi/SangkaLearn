import React, { useEffect } from 'react';
import PDFViewer from './PDFViewer';
import GoogleDriveVideoPlayer from './GoogleDriveVideoPlayer';
import { BookOpen, Image as ImageIcon } from 'lucide-react';

/**
 * LessonContentRenderer Component
 * Renders lesson content based on type with appropriate viewer and protection
 */
export default function LessonContentRenderer({ lesson, className = '' }) {
    // Disable right-click and print protection
    useEffect(() => {
        const preventContextMenu = (e) => {
            e.preventDefault();
            return false;
        };

        const preventPrint = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                return false;
            }
        };

        document.addEventListener('contextmenu', preventContextMenu);
        document.addEventListener('keydown', preventPrint);

        // Add CSS to hide print button
        const style = document.createElement('style');
        style.textContent = '@media print { body { display: none; } }';
        document.head.appendChild(style);

        return () => {
            document.removeEventListener('contextmenu', preventContextMenu);
            document.removeEventListener('keydown', preventPrint);
            document.head.removeChild(style);
        };
    }, []);

    // Render PDF Viewer for document type
    if (lesson.type === 'document' && lesson.document_file) {
        return (
            <div className={className}>
                <PDFViewer
                    pdfUrl={`/storage/${lesson.document_file}`}
                    title={lesson.title}
                />
            </div>
        );
    }

    // Render Google Drive Video Player for drive videos
    if (lesson.type === 'video' && lesson.video_provider === 'drive' && lesson.video_url) {
        return (
            <div className={className}>
                <GoogleDriveVideoPlayer
                    driveUrl={lesson.video_url}
                    title={lesson.title}
                />
            </div>
        );
    }

    // Render content blocks (new structured system)
    if (lesson.content_blocks && lesson.content_blocks.length > 0) {
        return (
            <div className={`space-y-6 ${className}`}>
                <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="w-5 h-5 text-gray-400" />
                    <h3 className="font-semibold text-gray-900">Konten Pembelajaran</h3>
                </div>

                {lesson.content_blocks.map((block, index) => {
                    if (block.type === 'text') {
                        return (
                            <div key={block.id || index} className="bg-gray-50 rounded-xl p-6">
                                <p className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap">
                                    {block.content}
                                </p>
                            </div>
                        );
                    }

                    if (block.type === 'image') {
                        return (
                            <div key={block.id || index} className="rounded-xl overflow-hidden shadow-md">
                                <img
                                    src={block.url || `/storage/${block.path}`}
                                    alt={block.caption || `Image ${index + 1}`}
                                    className="w-full h-auto"
                                    onContextMenu={(e) => e.preventDefault()}
                                    style={{ userSelect: 'none', pointerEvents: 'none' }}
                                />
                                {block.caption && (
                                    <div className="bg-gray-100 px-4 py-2">
                                        <p className="text-sm text-gray-700 italic text-center">
                                            {block.caption}
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    }

                    return null;
                })}
            </div>
        );
    }

    // Fallback: Render old content system (content + content_images)
    if (lesson.content || (lesson.content_images && lesson.content_images.length > 0)) {
        return (
            <div className={className}>
                <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="w-5 h-5 text-gray-400" />
                    <h3 className="font-semibold text-gray-900">Konten Pembelajaran</h3>
                </div>

                {/* Before content images */}
                {lesson.content_images?.filter(img => img.position === 'before_content').map((img, i) => (
                    <div key={`before-${i}`} className="mb-6">
                        <img
                            src={`/storage/${img.path}`}
                            alt={`Gambar ${i + 1}`}
                            className="w-full rounded-xl shadow-md"
                            onContextMenu={(e) => e.preventDefault()}
                            style={{ userSelect: 'none', pointerEvents: 'none' }}
                        />
                        <p className="text-sm text-gray-500 text-center mt-2">Gambar {i + 1}</p>
                    </div>
                ))}

                {/* Main content */}
                {lesson.content && (
                    <div className="bg-gray-50 rounded-xl p-6">
                        <div
                            className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-img:rounded-xl"
                            dangerouslySetInnerHTML={{ __html: lesson.content }}
                        />
                    </div>
                )}

                {/* After content images */}
                {lesson.content_images?.filter(img => img.position === 'after_content').map((img, i) => (
                    <div key={`after-${i}`} className="mt-6">
                        <img
                            src={`/storage/${img.path}`}
                            alt={`Gambar ${i + 1}`}
                            className="w-full rounded-xl shadow-md"
                            onContextMenu={(e) => e.preventDefault()}
                            style={{ userSelect: 'none', pointerEvents: 'none' }}
                        />
                        <p className="text-sm text-gray-500 text-center mt-2">Gambar {i + 1}</p>
                    </div>
                ))}
            </div>
        );
    }

    // No content available
    return (
        <div className={`bg-gray-50 rounded-xl p-8 text-center ${className}`}>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600">Konten pembelajaran belum tersedia</p>
        </div>
    );
}
