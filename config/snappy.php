<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Snappy PDF / Image Configuration
    |--------------------------------------------------------------------------
    |
    | This option contains settings for PDF generation.
    |
    | Enabled:
    |
    |    Whether to load PDF / Image generation.
    |
    | Binary:
    |
    |    The file path of the wkhtmltopdf / wkhtmltoimage executable.
    |
    | Timout:
    |
    |    The amount of time to wait (in seconds) before PDF / Image generation is stopped.
    |    Setting this to false disables the timeout (unlimited processing time).
    |
    | Options:
    |
    |    The wkhtmltopdf command options. These are passed directly to wkhtmltopdf.
    |    See https://wkhtmltopdf.org/usage/wkhtmltopdf.txt for all options.
    |
    | Env:
    |
    |    The environment variables to set while running the wkhtmltopdf process.
    |
    */

    'pdf' => [
        'enabled' => true,
        'binary'  => env('WKHTMLTOPDF_BINARY', base_path('bin/wkhtmltopdf/bin/wkhtmltopdf.exe')),
        'timeout' => false,
        'options' => [
            'enable-local-file-access' => true,
            'no-outline' => true,
            'page-width' => '270mm',
            'page-height' => '190mm',
            'margin-top' => 0,
            'margin-right' => 0,
            'margin-bottom' => 0,
            'margin-left' => 0,
            'encoding' => 'UTF-8',
            'dpi' => 300,
            'image-quality' => 100,
            'enable-javascript' => false,
            'javascript-delay' => 0,
            'no-stop-slow-scripts' => false,
            'enable-smart-shrinking' => false,
            'zoom' => 1,
            'disable-smart-shrinking' => true,
        ],
        'env' => [],
    ],

    'image' => [
        'enabled' => true,
        'binary'  => env('WKHTMLTOIMAGE_BINARY', base_path('bin/wkhtmltopdf/bin/wkhtmltoimage.exe')),
        'timeout' => false,
        'options' => [
            'enable-local-file-access' => true,
        ],
        'env' => [],
    ],

];
