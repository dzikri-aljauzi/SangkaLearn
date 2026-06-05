<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class FixStoragePermissions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'storage:fix-permissions
                            {--check : Only check permissions without fixing}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fix storage permissions and verify symbolic link for production environment';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $checkOnly = $this->option('check');

        $this->info('=================================================');
        $this->info('Storage Permission & Symlink Checker/Fixer');
        $this->info('=================================================');
        $this->newLine();

        // 1. Check if symbolic link exists
        $this->checkSymbolicLink($checkOnly);

        // 2. Check storage directory permissions
        $this->checkStoragePermissions($checkOnly);

        // 3. Check public storage directories
        $this->checkPublicStorageDirectories($checkOnly);

        // 4. Verify .htaccess in public directory
        $this->checkHtaccess($checkOnly);

        $this->newLine();
        $this->info('=================================================');

        if ($checkOnly) {
            $this->info('✓ Check completed. Use without --check flag to fix issues.');
        } else {
            $this->info('✓ All storage permissions and symlinks have been fixed!');
            $this->newLine();
            $this->warn('⚠ For VPS/Production Server:');
            $this->line('  1. Run: sudo chown -R www-data:www-data storage/');
            $this->line('  2. Run: sudo chown -R www-data:www-data public/storage/');
            $this->line('  3. Run: sudo chmod -R 775 storage/');
            $this->line('  4. Run: sudo chmod -R 775 public/storage/');
            $this->newLine();
            $this->info('  Replace "www-data" with your web server user (could be "nginx", "apache", etc.)');
        }

        $this->info('=================================================');

        return Command::SUCCESS;
    }

    /**
     * Check and fix symbolic link
     */
    private function checkSymbolicLink($checkOnly)
    {
        $this->info('1. Checking symbolic link...');

        $linkPath = public_path('storage');
        $targetPath = storage_path('app/public');

        if (file_exists($linkPath)) {
            if (is_link($linkPath)) {
                $currentTarget = readlink($linkPath);
                $this->line("   ✓ Symbolic link exists: public/storage -> {$currentTarget}");

                // Verify it points to correct location
                if (realpath($currentTarget) !== realpath($targetPath)) {
                    $this->warn("   ⚠ Symbolic link points to wrong location!");

                    if (!$checkOnly) {
                        // Remove old link and create new one
                        unlink($linkPath);
                        $this->call('storage:link');
                        $this->info("   ✓ Fixed: Recreated symbolic link");
                    }
                } else {
                    $this->info("   ✓ Symbolic link is correct");
                }
            } else {
                $this->error("   ✗ public/storage exists but is NOT a symbolic link!");

                if (!$checkOnly) {
                    // Remove directory/file and create symlink
                    if (is_dir($linkPath)) {
                        File::deleteDirectory($linkPath);
                    } else {
                        unlink($linkPath);
                    }
                    $this->call('storage:link');
                    $this->info("   ✓ Fixed: Created symbolic link");
                }
            }
        } else {
            $this->warn("   ⚠ Symbolic link does not exist!");

            if (!$checkOnly) {
                $this->call('storage:link');
                $this->info("   ✓ Fixed: Created symbolic link");
            }
        }

        $this->newLine();
    }

    /**
     * Check and fix storage directory permissions
     */
    private function checkStoragePermissions($checkOnly)
    {
        $this->info('2. Checking storage directory permissions...');

        $storagePath = storage_path();

        if (is_writable($storagePath)) {
            $this->info("   ✓ storage/ is writable");
        } else {
            $this->error("   ✗ storage/ is NOT writable!");

            if (!$checkOnly) {
                chmod($storagePath, 0775);
                $this->info("   ✓ Fixed: Set permissions to 775");
            }
        }

        // Check subdirectories
        $directories = [
            'storage/app',
            'storage/app/public',
            'storage/framework',
            'storage/logs',
        ];

        foreach ($directories as $dir) {
            $fullPath = base_path($dir);
            if (file_exists($fullPath)) {
                if (is_writable($fullPath)) {
                    $this->line("   ✓ {$dir} is writable");
                } else {
                    $this->warn("   ⚠ {$dir} is NOT writable!");

                    if (!$checkOnly) {
                        chmod($fullPath, 0775);
                        $this->info("   ✓ Fixed: Set {$dir} permissions to 775");
                    }
                }
            } else {
                $this->warn("   ⚠ {$dir} does not exist!");

                if (!$checkOnly) {
                    mkdir($fullPath, 0775, true);
                    $this->info("   ✓ Fixed: Created {$dir}");
                }
            }
        }

        $this->newLine();
    }

    /**
     * Check and create public storage directories
     */
    private function checkPublicStorageDirectories($checkOnly)
    {
        $this->info('3. Checking public storage directories...');

        $directories = [
            'courses/thumbnails',
            'lessons/images',
            'lessons/documents',
            'lessons/videos',
            'lessons/content-blocks',
            'lessons/attachments',
            'assignments',
            'avatars',
            'certificates',
            'meeting-screenshots',
        ];

        foreach ($directories as $dir) {
            $fullPath = storage_path('app/public/' . $dir);

            if (file_exists($fullPath)) {
                if (is_writable($fullPath)) {
                    $this->line("   ✓ {$dir} exists and is writable");
                } else {
                    $this->warn("   ⚠ {$dir} exists but NOT writable!");

                    if (!$checkOnly) {
                        chmod($fullPath, 0775);
                        $this->info("   ✓ Fixed: Set {$dir} permissions to 775");
                    }
                }
            } else {
                $this->warn("   ⚠ {$dir} does not exist!");

                if (!$checkOnly) {
                    mkdir($fullPath, 0775, true);
                    $this->info("   ✓ Fixed: Created {$dir}");
                }
            }
        }

        $this->newLine();
    }

    /**
     * Check .htaccess file in public directory
     */
    private function checkHtaccess($checkOnly)
    {
        $this->info('4. Checking .htaccess in public directory...');

        $htaccessPath = public_path('.htaccess');

        if (file_exists($htaccessPath)) {
            $this->line("   ✓ .htaccess exists");

            // Check if it has proper rewrite rules
            $content = file_get_contents($htaccessPath);

            if (strpos($content, 'RewriteEngine On') !== false) {
                $this->info("   ✓ RewriteEngine is enabled");
            } else {
                $this->warn("   ⚠ RewriteEngine might not be enabled properly");
            }
        } else {
            $this->error("   ✗ .htaccess does NOT exist in public directory!");

            if (!$checkOnly) {
                $this->warn("   ⚠ Please ensure your web server is configured correctly.");
                $this->line("   For Apache: .htaccess should be present");
                $this->line("   For Nginx: Configure proper location blocks");
            }
        }

        $this->newLine();
    }
}
