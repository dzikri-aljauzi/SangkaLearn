<?php

require_once 'vendor/autoload.php';

use App\Models\User;
use Illuminate\Foundation\Application;

// Bootstrap Laravel
$app = new Application(realpath(__DIR__));
$app->singleton(
    Illuminate\Contracts\Http\Kernel::class,
    App\Http\Kernel::class
);
$app->singleton(
    Illuminate\Contracts\Console\Kernel::class,
    App\Console\Kernel::class
);
$app->singleton(
    Illuminate\Contracts\Debug\ExceptionHandler::class,
    App\Exceptions\Handler::class
);

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Check admin user
$admin = User::where('email', 'admin@lmsbdi.com')->with('roles')->first();

if ($admin) {
    echo "Found admin user:\n";
    echo "Email: " . $admin->email . "\n";
    echo "Name: " . $admin->first_name . " " . $admin->last_name . "\n";
    echo "Active: " . ($admin->is_active ? 'Yes' : 'No') . "\n";
    echo "Email verified: " . ($admin->email_verified_at ? 'Yes' : 'No') . "\n";
    echo "Roles: " . $admin->roles->pluck('name')->join(', ') . "\n";
    echo "Created: " . $admin->created_at . "\n";
} else {
    echo "Admin user not found!\n";
}

// Check all users count
$userCount = User::count();
echo "\nTotal users in database: " . $userCount . "\n";

// List first 5 users
$users = User::take(5)->get();
echo "\nFirst 5 users:\n";
foreach ($users as $user) {
    echo "- " . $user->email . " (" . $user->first_name . " " . $user->last_name . ")\n";
}