<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\MidtransService;

class TestMidtransConnection extends Command
{
    protected $signature = 'midtrans:test-connection';
    protected $description = 'Test Midtrans API connection and SSL configuration';

    public function handle()
    {
        $this->info('Testing Midtrans Connection...');
        $this->newLine();

        try {
            $midtransService = new MidtransService();
            
            $this->info('📊 Configuration Check:');
            $this->line('├─ Server Key: ' . (config('midtrans.server_key') ? '✅ Set' : '❌ Missing'));
            $this->line('├─ Client Key: ' . (config('midtrans.client_key') ? '✅ Set' : '❌ Missing'));
            $this->line('├─ Production: ' . (config('midtrans.is_production') ? '✅ Yes' : '⚠️ Sandbox'));
            $this->line('├─ SSL Verify Peer: ' . (config('midtrans.curl_options.ssl_verify_peer', false) ? '✅ Enabled' : '⚠️ Disabled'));
            $this->line('└─ SSL Verify Host: ' . (config('midtrans.curl_options.ssl_verify_host', 0) ? '✅ Enabled' : '⚠️ Disabled'));
            
            $this->newLine();
            $this->info('🔗 Testing API Connection...');
            
            $result = $midtransService->testConnection();
            
            if ($result['success']) {
                $this->info('✅ ' . $result['message']);
                $this->info('Connection to Midtrans API is working properly!');
                return Command::SUCCESS;
            } else {
                $this->error('❌ ' . $result['message']);
                $this->error('Connection failed. Please check your configuration.');
                return Command::FAILURE;
            }
            
        } catch (\Exception $e) {
            $this->error('❌ Exception occurred: ' . $e->getMessage());
            $this->newLine();
            
            if (strpos($e->getMessage(), 'SSL certificate problem') !== false) {
                $this->warn('💡 SSL Issue Detected. Suggestions:');
                $this->line('   • Check if SSL verification is properly disabled in development');
                $this->line('   • Verify your SSL certificate bundle is up to date');
                $this->line('   • Consider updating your cURL SSL CA bundle');
            }
            
            return Command::FAILURE;
        }
    }
}