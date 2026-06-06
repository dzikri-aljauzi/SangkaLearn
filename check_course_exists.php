<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Course;

echo "Course Check\n";
echo "============\n";

$courses = Course::all();
echo "Total courses: " . $courses->count() . "\n\n";

if ($courses->count() > 0) {
    echo "Available courses:\n";
    foreach ($courses as $course) {
        echo "ID: " . $course->id . " - Title: " . $course->title . " - Slug: " . $course->slug . "\n";
    }
} else {
    echo "No courses found!\n";
}

echo "\n============\n";