<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule assignment deadline notifications to run daily at 9 AM
Schedule::command('assignments:check-deadlines')
    ->dailyAt('09:00')
    ->withoutOverlapping()
    ->onOneServer();

// Schedule auto-archive for expired courses to run daily at midnight
Schedule::command('courses:archive-expired')
    ->daily()
    ->withoutOverlapping()
    ->onOneServer();

// Schedule progress sync to run every 30 minutes
// This recalculates progress and generates missing certificates
Schedule::command('progress:sync --force')
    ->everyThirtyMinutes()
    ->withoutOverlapping()
    ->onOneServer();
