<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ChunkedUploadController extends Controller
{
    /**
     * Start a chunked upload session
     */
    public function start(Request $request)
    {
        try {
            $validated = $request->validate([
                'filename' => 'required|string',
                'filesize' => 'required|integer',
                'total_chunks' => 'required|integer',
                'file_type' => 'required|string'
            ]);

            // Generate unique upload ID
            $uploadId = Str::uuid()->toString();

            // Create upload metadata
            $metadata = [
                'upload_id' => $uploadId,
                'filename' => $validated['filename'],
                'filesize' => $validated['filesize'],
                'total_chunks' => $validated['total_chunks'],
                'file_type' => $validated['file_type'],
                'chunks_uploaded' => [],
                'created_at' => now()->toIso8601String(),
                'status' => 'in_progress'
            ];

            // Create directory structure using native PHP for reliability
            $baseDir = storage_path('app/uploads/chunks/' . $uploadId);
            $chunksDir = $baseDir . '/chunks';

            if (!file_exists($baseDir)) {
                if (!mkdir($baseDir, 0755, true)) {
                    throw new \Exception("Failed to create upload directory: {$baseDir}");
                }
            }

            if (!file_exists($chunksDir)) {
                if (!mkdir($chunksDir, 0755, true)) {
                    throw new \Exception("Failed to create chunks directory: {$chunksDir}");
                }
            }

            // Verify directories were created
            if (!is_dir($baseDir) || !is_writable($baseDir)) {
                throw new \Exception("Upload directory is not writable: {$baseDir}");
            }

            if (!is_dir($chunksDir) || !is_writable($chunksDir)) {
                throw new \Exception("Chunks directory is not writable: {$chunksDir}");
            }

            // Store metadata
            $metadataPath = "uploads/chunks/{$uploadId}/metadata.json";
            Storage::disk('local')->put($metadataPath, json_encode($metadata));

            Log::info("Chunked upload started", [
                'upload_id' => $uploadId,
                'filename' => $validated['filename'],
                'base_dir' => $baseDir,
                'chunks_dir' => $chunksDir,
                'directories_created' => true
            ]);

            return response()->json([
                'success' => true,
                'upload_id' => $uploadId,
                'message' => 'Upload session started'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to start chunked upload: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to start upload: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Upload a single chunk
     */
    public function uploadChunk(Request $request)
    {
        try {
            $validated = $request->validate([
                'upload_id' => 'required|string',
                'chunk_index' => 'required|integer',
                'chunk' => 'required|file'
            ]);

            $uploadId = $validated['upload_id'];
            $chunkIndex = $validated['chunk_index'];

            // Get metadata
            $metadataPath = "uploads/chunks/{$uploadId}/metadata.json";
            if (!Storage::disk('local')->exists($metadataPath)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Upload session not found'
                ], 404);
            }

            $metadata = json_decode(Storage::disk('local')->get($metadataPath), true);

            // Ensure chunks directory exists (double check)
            $chunksDir = storage_path('app/uploads/chunks/' . $uploadId . '/chunks');
            if (!file_exists($chunksDir)) {
                if (!mkdir($chunksDir, 0755, true)) {
                    throw new \Exception("Failed to create chunks directory: {$chunksDir}");
                }
            }

            // Save chunk using native PHP for better reliability
            $chunkFileName = "chunk_{$chunkIndex}";
            $chunkFullPath = $chunksDir . '/' . $chunkFileName;

            // Get uploaded file
            $uploadedFile = $request->file('chunk');

            // Move uploaded file to chunks directory
            if (!$uploadedFile->move($chunksDir, $chunkFileName)) {
                throw new \Exception("Failed to save chunk {$chunkIndex} to: {$chunkFullPath}");
            }

            // Verify chunk was saved successfully
            if (!file_exists($chunkFullPath)) {
                throw new \Exception("Chunk {$chunkIndex} was not saved to: {$chunkFullPath}");
            }

            $chunkSize = filesize($chunkFullPath);
            Log::info("Chunk saved successfully", [
                'upload_id' => $uploadId,
                'chunk_index' => $chunkIndex,
                'chunk_path' => $chunkFullPath,
                'chunk_size' => $chunkSize,
                'file_exists' => file_exists($chunkFullPath)
            ]);

            // Update metadata
            if (!in_array($chunkIndex, $metadata['chunks_uploaded'])) {
                $metadata['chunks_uploaded'][] = $chunkIndex;
                sort($metadata['chunks_uploaded']);
            }
            $metadata['updated_at'] = now()->toIso8601String();

            Storage::disk('local')->put($metadataPath, json_encode($metadata));

            $uploadedChunks = count($metadata['chunks_uploaded']);
            $totalChunks = $metadata['total_chunks'];
            $progress = ($uploadedChunks / $totalChunks) * 100;

            Log::info("Chunk uploaded", [
                'upload_id' => $uploadId,
                'chunk_index' => $chunkIndex,
                'progress' => $progress
            ]);

            return response()->json([
                'success' => true,
                'uploaded_chunks' => $uploadedChunks,
                'total_chunks' => $totalChunks,
                'progress' => round($progress, 2),
                'message' => 'Chunk uploaded successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to upload chunk', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'upload_id' => $uploadId ?? 'unknown',
                'chunk_index' => $chunkIndex ?? 'unknown',
                'chunks_dir' => $chunksDir ?? 'unknown',
                'file_provided' => $request->hasFile('chunk')
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload chunk: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check upload status and get missing chunks
     */
    public function status(Request $request)
    {
        try {
            $uploadId = $request->input('upload_id');

            $metadataPath = "uploads/chunks/{$uploadId}/metadata.json";
            if (!Storage::disk('local')->exists($metadataPath)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Upload session not found'
                ], 404);
            }

            $metadata = json_decode(Storage::disk('local')->get($metadataPath), true);

            $uploadedChunks = $metadata['chunks_uploaded'];
            $totalChunks = $metadata['total_chunks'];

            // Verify actual chunk files exist on disk
            $chunksDir = storage_path('app/uploads/chunks/' . $uploadId . '/chunks');
            $actualUploadedChunks = [];

            foreach ($uploadedChunks as $chunkIndex) {
                $chunkPath = $chunksDir . '/chunk_' . $chunkIndex;
                if (file_exists($chunkPath)) {
                    $actualUploadedChunks[] = $chunkIndex;
                } else {
                    Log::warning("Chunk in metadata but missing from disk", [
                        'upload_id' => $uploadId,
                        'chunk_index' => $chunkIndex,
                        'expected_path' => $chunkPath
                    ]);
                }
            }

            // Calculate missing chunks based on actual files
            $allChunks = range(0, $totalChunks - 1);
            $missingChunks = array_values(array_diff($allChunks, $actualUploadedChunks));

            $progress = (count($actualUploadedChunks) / $totalChunks) * 100;

            Log::info("Upload status checked", [
                'upload_id' => $uploadId,
                'metadata_chunks' => count($uploadedChunks),
                'actual_chunks' => count($actualUploadedChunks),
                'missing_chunks' => count($missingChunks)
            ]);

            return response()->json([
                'success' => true,
                'upload_id' => $uploadId,
                'filename' => $metadata['filename'],
                'filesize' => $metadata['filesize'],
                'uploaded_chunks' => $actualUploadedChunks, // Use actual chunks from disk
                'missing_chunks' => $missingChunks,
                'total_chunks' => $totalChunks,
                'progress' => round($progress, 2),
                'status' => $metadata['status']
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to get upload status: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to get upload status: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Complete upload and merge chunks
     */
    public function complete(Request $request)
    {
        try {
            $validated = $request->validate([
                'upload_id' => 'required|string',
                'storage_path' => 'required|string' // e.g., 'lessons/videos'
            ]);

            $uploadId = $validated['upload_id'];
            $storagePath = $validated['storage_path'];

            // Get metadata
            $metadataPath = "uploads/chunks/{$uploadId}/metadata.json";
            if (!Storage::disk('local')->exists($metadataPath)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Upload session not found'
                ], 404);
            }

            $metadata = json_decode(Storage::disk('local')->get($metadataPath), true);

            // Verify all chunks are uploaded
            if (count($metadata['chunks_uploaded']) !== $metadata['total_chunks']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Not all chunks have been uploaded'
                ], 400);
            }

            // Verify all chunk files actually exist on disk
            $chunksDir = storage_path('app/uploads/chunks/' . $uploadId . '/chunks');
            $missingChunks = [];

            for ($i = 0; $i < $metadata['total_chunks']; $i++) {
                $chunkPath = $chunksDir . '/chunk_' . $i;
                if (!file_exists($chunkPath)) {
                    $missingChunks[] = $i;
                    Log::error("Chunk file missing before merge", [
                        'upload_id' => $uploadId,
                        'chunk_index' => $i,
                        'expected_path' => $chunkPath
                    ]);
                }
            }

            if (!empty($missingChunks)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Some chunk files are missing: ' . implode(', ', $missingChunks),
                    'missing_chunks' => $missingChunks
                ], 400);
            }

            Log::info("All chunks verified, starting merge", [
                'upload_id' => $uploadId,
                'total_chunks' => $metadata['total_chunks'],
                'chunks_dir' => $chunksDir
            ]);

            // Merge chunks
            $filename = $metadata['filename'];
            $finalPath = $storagePath . '/' . Str::uuid() . '_' . $filename;
            $tempDir = storage_path('app/uploads/chunks/' . $uploadId);
            $tempFile = $tempDir . '/merged_file';

            // Ensure directory exists
            if (!file_exists($tempDir)) {
                mkdir($tempDir, 0755, true);
            }

            // Create merged file
            $outputHandle = @fopen($tempFile, 'wb');
            if (!$outputHandle) {
                throw new \Exception("Failed to create merged file at: {$tempFile}");
            }

            try {
                for ($i = 0; $i < $metadata['total_chunks']; $i++) {
                    $chunkPath = storage_path('app/uploads/chunks/' . $uploadId . '/chunks/chunk_' . $i);

                    if (!file_exists($chunkPath)) {
                        fclose($outputHandle);
                        if (file_exists($tempFile)) {
                            unlink($tempFile);
                        }
                        throw new \Exception("Chunk {$i} is missing at: {$chunkPath}");
                    }

                    $chunkHandle = @fopen($chunkPath, 'rb');
                    if (!$chunkHandle) {
                        fclose($outputHandle);
                        if (file_exists($tempFile)) {
                            unlink($tempFile);
                        }
                        throw new \Exception("Failed to read chunk {$i}");
                    }

                    stream_copy_to_stream($chunkHandle, $outputHandle);
                    fclose($chunkHandle);
                }

                fclose($outputHandle);

                // Verify merged file exists and has content
                if (!file_exists($tempFile) || filesize($tempFile) === 0) {
                    throw new \Exception("Merged file is empty or does not exist");
                }

                // Move merged file to public storage
                $fileContents = file_get_contents($tempFile);
                Storage::disk('public')->put($finalPath, $fileContents);

                // Verify file was written to public storage
                if (!Storage::disk('public')->exists($finalPath)) {
                    throw new \Exception("Failed to save file to public storage");
                }

                // Get file info
                $fileSize = Storage::disk('public')->size($finalPath);
                $mimeType = Storage::disk('public')->mimeType($finalPath);

                // Clean up chunks and temp file
                if (file_exists($tempFile)) {
                    unlink($tempFile);
                }
                Storage::disk('local')->deleteDirectory("uploads/chunks/{$uploadId}");
            } catch (\Exception $e) {
                // Cleanup on error
                if (isset($outputHandle) && is_resource($outputHandle)) {
                    fclose($outputHandle);
                }
                if (file_exists($tempFile)) {
                    unlink($tempFile);
                }
                throw $e;
            }

            Log::info("Chunked upload completed", [
                'upload_id' => $uploadId,
                'final_path' => $finalPath,
                'file_size' => $fileSize
            ]);

            return response()->json([
                'success' => true,
                'file_path' => $finalPath,
                'file_size' => $fileSize,
                'mime_type' => $mimeType,
                'original_name' => $filename,
                'message' => 'Upload completed successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to complete chunked upload: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to complete upload: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cancel upload and cleanup
     */
    public function cancel(Request $request)
    {
        try {
            $uploadId = $request->input('upload_id');

            // Delete chunks directory
            Storage::disk('local')->deleteDirectory("uploads/chunks/{$uploadId}");

            Log::info("Chunked upload cancelled", ['upload_id' => $uploadId]);

            return response()->json([
                'success' => true,
                'message' => 'Upload cancelled'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to cancel upload: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel upload: ' . $e->getMessage()
            ], 500);
        }
    }
}
