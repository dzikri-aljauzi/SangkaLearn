<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\Exceptions\PostTooLargeException;
use Symfony\Component\HttpFoundation\Response;

class CheckPostSize
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $maxPostSize = $this->getPostMaxSize();

        if ($maxPostSize > 0 && $request->server('CONTENT_LENGTH') > $maxPostSize) {
            // Instead of throwing exception, return with error message
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'The uploaded data is too large. Please reduce file size or form data.',
                    'error' => 'post_too_large',
                    'max_size' => $this->formatBytes($maxPostSize),
                    'current_size' => $this->formatBytes($request->server('CONTENT_LENGTH'))
                ], 413);
            }

            return back()
                ->withInput()
                ->withErrors([
                    'file' => "The uploaded data is too large. Maximum allowed size is {$this->formatBytes($maxPostSize)}. Your data size is {$this->formatBytes($request->server('CONTENT_LENGTH'))}."
                ]);
        }

        return $next($request);
    }

    /**
     * Get the maximum POST size allowed.
     *
     * @return int
     */
    protected function getPostMaxSize(): int
    {
        if (is_numeric($postMaxSize = ini_get('post_max_size'))) {
            return (int) $postMaxSize;
        }

        $metric = strtoupper(substr($postMaxSize, -1));
        $postMaxSize = (int) $postMaxSize;

        switch ($metric) {
            case 'K':
                return $postMaxSize * 1024;
            case 'M':
                return $postMaxSize * 1048576;
            case 'G':
                return $postMaxSize * 1073741824;
            default:
                return $postMaxSize;
        }
    }

    /**
     * Format bytes to human readable format.
     *
     * @param int $bytes
     * @return string
     */
    protected function formatBytes(int $bytes): string
    {
        if ($bytes >= 1073741824) {
            return number_format($bytes / 1073741824, 2) . ' GB';
        } elseif ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2) . ' MB';
        } elseif ($bytes >= 1024) {
            return number_format($bytes / 1024, 2) . ' KB';
        } else {
            return $bytes . ' bytes';
        }
    }
}