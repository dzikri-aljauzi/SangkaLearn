<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Http;

class ViteProxyController extends Controller
{
    public function proxy(Request $request, $path)
    {
        $viteUrl = 'http://localhost:5174/' . $path;

        try {
            $response = Http::timeout(10)->get($viteUrl);

            if ($response->failed()) {
                abort(404);
            }

            $content = $response->body();
            $contentType = $response->header('Content-Type') ?? $this->getMimeType($path);

            return response($content, 200, [
                'Content-Type' => $contentType,
                'Access-Control-Allow-Origin' => '*',
                'Access-Control-Allow-Methods' => 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers' => 'Content-Type, Authorization',
                'Cache-Control' => 'no-cache'
            ]);

        } catch (\Exception $e) {
            abort(404);
        }
    }

    private function getMimeType($path)
    {
        $extension = pathinfo($path, PATHINFO_EXTENSION);

        return match($extension) {
            'js', 'jsx' => 'application/javascript',
            'css' => 'text/css',
            'ts', 'tsx' => 'application/typescript',
            'json' => 'application/json',
            default => 'text/plain'
        };
    }
}