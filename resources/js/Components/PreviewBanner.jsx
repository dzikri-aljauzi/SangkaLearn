import React from 'react';
import { Link } from '@inertiajs/react';
import { Eye, ArrowLeft, ShoppingBag, BookOpen } from 'lucide-react';

export default function PreviewBanner({ returnUrl, previewEnrolledUrl = null, previewPublicUrl = null }) {
    // Determine current view mode
    const isEnrolledView = previewPublicUrl !== null; // If we have public URL, we're in enrolled view
    const canSwitchView = previewEnrolledUrl || previewPublicUrl;

    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-14">
                    {/* Left: Preview Indicator */}
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2 bg-white bg-opacity-20 rounded-full px-4 py-1.5">
                            <Eye className="w-4 h-4 text-white" />
                            <span className="text-sm font-medium text-white">
                                Preview Mode {isEnrolledView ? '(Enrolled)' : '(Public)'}
                            </span>
                        </div>
                        <span className="hidden md:block text-sm text-white text-opacity-90">
                            {isEnrolledView
                                ? 'Viewing as enrolled student'
                                : 'Viewing public course page'}
                        </span>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center space-x-2">
                        {/* Switch View Button */}
                        {canSwitchView && (
                            <Link
                                href={isEnrolledView ? previewPublicUrl : previewEnrolledUrl}
                                className="inline-flex items-center space-x-2 px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-white hover:bg-opacity-30 transition-colors font-medium"
                                title={isEnrolledView ? 'Switch to Public View' : 'Switch to Enrolled View'}
                            >
                                {isEnrolledView ? (
                                    <>
                                        <ShoppingBag className="w-4 h-4" />
                                        <span className="hidden sm:inline">Public View</span>
                                    </>
                                ) : (
                                    <>
                                        <BookOpen className="w-4 h-4" />
                                        <span className="hidden sm:inline">Enrolled View</span>
                                    </>
                                )}
                            </Link>
                        )}

                        {/* Exit Preview Button */}
                        <Link
                            href={returnUrl}
                            className="inline-flex items-center space-x-2 px-4 py-2 bg-white text-purple-700 rounded-lg hover:bg-purple-50 transition-colors font-medium shadow-md"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Exit Preview</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
