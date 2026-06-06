<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class CleanSoftDeletedUsers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'users:clean-soft-deleted {--force : Force delete without confirmation}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Permanently remove soft deleted users from database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔍 Checking for soft deleted users...');
        
        $softDeletedUsers = User::onlyTrashed()->get(['id', 'email', 'deleted_at']);
        
        if ($softDeletedUsers->isEmpty()) {
            $this->info('✅ No soft deleted users found. Database is clean!');
            return 0;
        }
        
        $this->info("Found {$softDeletedUsers->count()} soft deleted users:");
        
        $headers = ['ID', 'Email', 'Deleted At'];
        $rows = $softDeletedUsers->map(function ($user) {
            return [$user->id, $user->email, $user->deleted_at->format('Y-m-d H:i:s')];
        })->toArray();
        
        $this->table($headers, $rows);
        
        if (!$this->option('force')) {
            if (!$this->confirm('Do you want to permanently delete these users?')) {
                $this->info('Operation cancelled.');
                return 0;
            }
        }
        
        $this->info('🧹 Permanently deleting soft deleted users...');
        
        $deletedCount = 0;
        foreach ($softDeletedUsers as $user) {
            try {
                $user->forceDelete();
                $this->line("✅ Deleted: {$user->email}");
                $deletedCount++;
            } catch (\Exception $e) {
                $this->error("❌ Failed to delete {$user->email}: {$e->getMessage()}");
            }
        }
        
        $this->info("🎉 Successfully deleted {$deletedCount} users permanently.");
        $this->info('Email addresses are now available for new registrations.');
        
        return 0;
    }
}
