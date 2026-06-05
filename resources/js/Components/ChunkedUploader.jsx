import React, { useState, useRef, useEffect } from 'react';
import { Upload, Pause, Play, X, CheckCircle, AlertCircle, Video } from 'lucide-react';
import axios from 'axios';

const ChunkedUploader = ({
    onUploadComplete,
    onUploadError,
    onStateChange,
    accept = "video/*",
    maxSize = 5 * 1024 * 1024 * 1024, // 5GB default
    chunkSize = 5 * 1024 * 1024, // 5MB chunks
    storagePath = "lessons/videos",
    existingFile = null,
    onRemove = null
}) => {
    const [file, setFile] = useState(null);
    const [uploadState, setUploadState] = useState('idle'); // idle, uploading, paused, completed, error
    const [uploadId, setUploadId] = useState(null);
    const [progress, setProgress] = useState(0);
    const [uploadedChunks, setUploadedChunks] = useState([]);
    const [currentChunk, setCurrentChunk] = useState(0);
    const [uploadSpeed, setUploadSpeed] = useState(0);
    const [estimatedTime, setEstimatedTime] = useState(0);
    const [errorMessage, setErrorMessage] = useState('');
    const [uploadedBytes, setUploadedBytes] = useState(0);

    const fileInputRef = useRef(null);
    const isPausedRef = useRef(false);
    const uploadStartTimeRef = useRef(null);
    const lastUploadedBytesRef = useRef(0);
    const speedIntervalRef = useRef(null);

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (speedIntervalRef.current) {
                clearInterval(speedIntervalRef.current);
            }
        };
    }, []);

    // Notify parent of state changes
    useEffect(() => {
        if (onStateChange) {
            onStateChange({
                state: uploadState,
                hasFile: !!file || !!existingFile,
                isCompleted: uploadState === 'completed' || !!existingFile,
                isUploading: uploadState === 'uploading',
                progress: progress
            });
        }
    }, [uploadState, file, existingFile, progress]);

    // Format bytes to readable size
    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    // Format time to readable format
    const formatTime = (seconds) => {
        if (!seconds || !isFinite(seconds)) return 'Calculating...';
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
        if (mins > 0) return `${mins}m ${secs}s`;
        return `${secs}s`;
    };

    // Calculate upload speed
    const calculateSpeed = () => {
        if (!uploadStartTimeRef.current) return;

        const elapsedTime = (Date.now() - uploadStartTimeRef.current) / 1000; // in seconds
        const bytesUploaded = uploadedBytes - lastUploadedBytesRef.current;
        const speed = bytesUploaded / elapsedTime; // bytes per second

        setUploadSpeed(speed);
        lastUploadedBytesRef.current = uploadedBytes;
        uploadStartTimeRef.current = Date.now();
    };

    // Start speed calculation interval
    const startSpeedCalculation = () => {
        uploadStartTimeRef.current = Date.now();
        lastUploadedBytesRef.current = uploadedBytes;

        speedIntervalRef.current = setInterval(() => {
            calculateSpeed();
        }, 1000);
    };

    // Stop speed calculation interval
    const stopSpeedCalculation = () => {
        if (speedIntervalRef.current) {
            clearInterval(speedIntervalRef.current);
            speedIntervalRef.current = null;
        }
    };

    // Handle file selection
    const handleFileSelect = (event) => {
        const selectedFile = event.target.files[0];

        if (!selectedFile) return;

        // Validate file size
        if (selectedFile.size > maxSize) {
            setErrorMessage(`File size exceeds maximum allowed size of ${formatBytes(maxSize)}`);
            setUploadState('error');
            return;
        }

        // Reset all states
        setFile(selectedFile);
        setUploadState('idle');
        setProgress(0);
        setUploadedChunks([]);
        setCurrentChunk(0);
        setErrorMessage('');
        setUploadedBytes(0);
        setUploadSpeed(0);
        setEstimatedTime(0);
        setUploadId(null);
    };

    // Start upload
    const startUpload = async () => {
        if (!file) return;

        try {
            setUploadState('uploading');
            setErrorMessage('');
            isPausedRef.current = false;

            // Calculate total chunks
            const totalChunks = Math.ceil(file.size / chunkSize);

            // Start upload session
            const startResponse = await axios.post(route('admin.chunked-upload.start'), {
                filename: file.name,
                filesize: file.size,
                total_chunks: totalChunks,
                file_type: file.type
            });

            const uploadSessionId = startResponse.data.upload_id;
            setUploadId(uploadSessionId);

            // Check if there are already uploaded chunks (resume)
            let missingChunks = Array.from({ length: totalChunks }, (_, i) => i);

            try {
                const statusResponse = await axios.get(route('admin.chunked-upload.status'), {
                    params: { upload_id: uploadSessionId }
                });

                if (statusResponse.data.success) {
                    missingChunks = statusResponse.data.missing_chunks;
                    setUploadedChunks(statusResponse.data.uploaded_chunks);
                    const initialProgress = (statusResponse.data.uploaded_chunks.length / totalChunks) * 100;
                    setProgress(initialProgress);
                    setUploadedBytes(statusResponse.data.uploaded_chunks.length * chunkSize);
                }
            } catch (error) {
                console.log('No previous upload found, starting fresh');
            }

            // Start speed calculation
            startSpeedCalculation();

            // Upload chunks
            await uploadChunks(uploadSessionId, missingChunks, totalChunks);

        } catch (error) {
            console.error('Upload error:', error);
            setErrorMessage(error.response?.data?.message || 'Failed to start upload');
            setUploadState('error');
            stopSpeedCalculation();
        }
    };

    // Upload chunks
    const uploadChunks = async (uploadSessionId, chunksToUpload, totalChunks) => {
        for (let i = 0; i < chunksToUpload.length; i++) {
            // Check if paused
            if (isPausedRef.current) {
                setUploadState('paused');
                stopSpeedCalculation();
                return;
            }

            const chunkIndex = chunksToUpload[i];
            setCurrentChunk(chunkIndex);

            try {
                // Create chunk
                const start = chunkIndex * chunkSize;
                const end = Math.min(start + chunkSize, file.size);
                const chunk = file.slice(start, end);

                // Upload chunk
                const formData = new FormData();
                formData.append('upload_id', uploadSessionId);
                formData.append('chunk_index', chunkIndex);
                formData.append('chunk', chunk);

                const response = await axios.post(route('admin.chunked-upload.chunk'), formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    timeout: 30000 // 30 second timeout per chunk
                });

                if (response.data.success) {
                    const newUploadedChunks = [...uploadedChunks, chunkIndex];
                    setUploadedChunks(newUploadedChunks);
                    setProgress(response.data.progress);

                    const newUploadedBytes = newUploadedChunks.length * chunkSize;
                    setUploadedBytes(newUploadedBytes);

                    // Calculate estimated time
                    const remainingBytes = file.size - newUploadedBytes;
                    const estimated = uploadSpeed > 0 ? remainingBytes / uploadSpeed : 0;
                    setEstimatedTime(estimated);
                }

            } catch (error) {
                console.error(`Error uploading chunk ${chunkIndex}:`, error);

                // Retry logic (up to 3 times)
                let retryCount = 0;
                let uploaded = false;

                while (retryCount < 3 && !uploaded) {
                    try {
                        retryCount++;
                        console.log(`Retrying chunk ${chunkIndex}, attempt ${retryCount}`);

                        const start = chunkIndex * chunkSize;
                        const end = Math.min(start + chunkSize, file.size);
                        const chunk = file.slice(start, end);

                        const formData = new FormData();
                        formData.append('upload_id', uploadSessionId);
                        formData.append('chunk_index', chunkIndex);
                        formData.append('chunk', chunk);

                        await axios.post(route('admin.chunked-upload.chunk'), formData);
                        uploaded = true;

                    } catch (retryError) {
                        if (retryCount === 3) {
                            setErrorMessage(`Failed to upload chunk ${chunkIndex} after 3 attempts`);
                            setUploadState('error');
                            stopSpeedCalculation();
                            return;
                        }

                        // Wait before retry
                        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
                    }
                }
            }
        }

        // All chunks uploaded, complete the upload
        await completeUpload(uploadSessionId);
    };

    // Complete upload
    const completeUpload = async (uploadSessionId) => {
        try {
            const response = await axios.post(route('admin.chunked-upload.complete'), {
                upload_id: uploadSessionId,
                storage_path: storagePath
            });

            if (response.data.success) {
                setUploadState('completed');
                setProgress(100);
                stopSpeedCalculation();

                // Call success callback
                if (onUploadComplete) {
                    onUploadComplete({
                        file_path: response.data.file_path,
                        file_size: response.data.file_size,
                        mime_type: response.data.mime_type,
                        original_name: response.data.original_name
                    });
                }
            }
        } catch (error) {
            console.error('Error completing upload:', error);
            setErrorMessage(error.response?.data?.message || 'Failed to complete upload');
            setUploadState('error');
            stopSpeedCalculation();

            if (onUploadError) {
                onUploadError(error);
            }
        }
    };

    // Pause upload
    const pauseUpload = () => {
        isPausedRef.current = true;
        setUploadState('paused');
        stopSpeedCalculation();
    };

    // Resume upload
    const resumeUpload = async () => {
        if (!uploadId || !file) return;

        try {
            setUploadState('uploading');
            isPausedRef.current = false;

            // Get status to find missing chunks
            const statusResponse = await axios.get(route('admin.chunked-upload.status'), {
                params: { upload_id: uploadId }
            });

            if (statusResponse.data.success) {
                const missingChunks = statusResponse.data.missing_chunks;
                const totalChunks = statusResponse.data.total_chunks;

                // Restart speed calculation
                startSpeedCalculation();

                // Continue uploading missing chunks
                await uploadChunks(uploadId, missingChunks, totalChunks);
            }
        } catch (error) {
            console.error('Error resuming upload:', error);
            setErrorMessage('Failed to resume upload');
            setUploadState('error');
            stopSpeedCalculation();
        }
    };

    // Cancel upload
    const cancelUpload = async () => {
        try {
            if (uploadId) {
                await axios.post(route('admin.chunked-upload.cancel'), {
                    upload_id: uploadId
                });
            }

            setFile(null);
            setUploadState('idle');
            setProgress(0);
            setUploadedChunks([]);
            setCurrentChunk(0);
            setUploadId(null);
            setErrorMessage('');
            setUploadedBytes(0);
            setUploadSpeed(0);
            setEstimatedTime(0);
            stopSpeedCalculation();

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            console.error('Error cancelling upload:', error);
        }
    };

    // Remove existing file
    const handleRemoveExisting = () => {
        if (onRemove) {
            onRemove();
        }
    };

    return (
        <div className="space-y-4">
            {/* File Input */}
            {!file && !existingFile && (
                <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-10 h-10 mb-3 text-gray-400" />
                            <p className="mb-2 text-sm text-gray-500">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">
                                Video files up to {formatBytes(maxSize)}
                            </p>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept={accept}
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                    </label>
                </div>
            )}

            {/* Existing File Display */}
            {existingFile && !file && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                                <Video className="w-8 h-8 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-green-900">
                                    Current Video: {existingFile.name || 'Uploaded Video'}
                                </p>
                                {existingFile.size && (
                                    <p className="text-xs text-green-700">
                                        {formatBytes(existingFile.size)}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Replace
                            </button>
                            {onRemove && (
                                <button
                                    type="button"
                                    onClick={handleRemoveExisting}
                                    className="px-3 py-1 text-sm text-red-600 hover:text-red-800 font-medium"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={accept}
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                </div>
            )}

            {/* Selected File Display */}
            {file && (
                <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                                <Video className="w-8 h-8 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                <p className="text-xs text-gray-500">{formatBytes(file.size)}</p>
                            </div>
                        </div>
                        {uploadState === 'idle' && (
                            <button
                                type="button"
                                onClick={cancelUpload}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    {/* Upload Progress */}
                    {uploadState !== 'idle' && (
                        <div className="space-y-3">
                            {/* Progress Bar */}
                            <div className="relative">
                                <div className="overflow-hidden h-3 text-xs flex rounded-full bg-gray-200">
                                    <div
                                        style={{ width: `${progress}%` }}
                                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-300 ${
                                            uploadState === 'completed' ? 'bg-green-500' :
                                            uploadState === 'error' ? 'bg-red-500' :
                                            uploadState === 'paused' ? 'bg-yellow-500' :
                                            'bg-blue-500'
                                        }`}
                                    />
                                </div>
                                <p className="text-xs text-gray-600 mt-1 text-center font-medium">
                                    {progress.toFixed(1)}%
                                </p>
                            </div>

                            {/* Upload Stats */}
                            {uploadState === 'uploading' && (
                                <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                                    <div>
                                        <p className="font-medium">Speed</p>
                                        <p>{formatBytes(uploadSpeed)}/s</p>
                                    </div>
                                    <div>
                                        <p className="font-medium">Uploaded</p>
                                        <p>{formatBytes(uploadedBytes)} / {formatBytes(file.size)}</p>
                                    </div>
                                    <div>
                                        <p className="font-medium">Time Left</p>
                                        <p>{formatTime(estimatedTime)}</p>
                                    </div>
                                </div>
                            )}

                            {/* Status Messages */}
                            {uploadState === 'completed' && (
                                <div className="flex items-center space-x-2 text-green-600">
                                    <CheckCircle className="w-5 h-5" />
                                    <span className="text-sm font-medium">Upload completed successfully!</span>
                                </div>
                            )}

                            {uploadState === 'error' && (
                                <div className="flex items-center space-x-2 text-red-600">
                                    <AlertCircle className="w-5 h-5" />
                                    <span className="text-sm">{errorMessage}</span>
                                </div>
                            )}

                            {uploadState === 'paused' && (
                                <div className="flex items-center space-x-2 text-yellow-600">
                                    <Pause className="w-5 h-5" />
                                    <span className="text-sm font-medium">Upload paused</span>
                                </div>
                            )}

                            {/* Control Buttons */}
                            <div className="flex items-center space-x-2">
                                {uploadState === 'idle' && (
                                    <button
                                        type="button"
                                        onClick={startUpload}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm flex items-center justify-center space-x-2"
                                    >
                                        <Upload className="w-4 h-4" />
                                        <span>Start Upload</span>
                                    </button>
                                )}

                                {uploadState === 'uploading' && (
                                    <button
                                        type="button"
                                        onClick={pauseUpload}
                                        className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium text-sm flex items-center justify-center space-x-2"
                                    >
                                        <Pause className="w-4 h-4" />
                                        <span>Pause</span>
                                    </button>
                                )}

                                {uploadState === 'paused' && (
                                    <button
                                        type="button"
                                        onClick={resumeUpload}
                                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm flex items-center justify-center space-x-2"
                                    >
                                        <Play className="w-4 h-4" />
                                        <span>Resume</span>
                                    </button>
                                )}

                                {(uploadState === 'uploading' || uploadState === 'paused' || uploadState === 'error') && uploadState !== 'completed' && (
                                    <button
                                        type="button"
                                        onClick={cancelUpload}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm flex items-center justify-center space-x-2"
                                    >
                                        <X className="w-4 h-4" />
                                        <span>Cancel</span>
                                    </button>
                                )}

                                {uploadState === 'completed' && (
                                    <button
                                        type="button"
                                        onClick={cancelUpload}
                                        className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium text-sm"
                                    >
                                        Upload Another
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Auto-start upload button for initial state */}
                    {uploadState === 'idle' && (
                        <button
                            type="button"
                            onClick={startUpload}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm flex items-center justify-center space-x-2"
                        >
                            <Upload className="w-4 h-4" />
                            <span>Start Upload</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default ChunkedUploader;
