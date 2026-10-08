<?php

namespace Database\Seeders;

use App\Models\CertificateProvider;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CertificateProviderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $providers = [
            [
                'name' => 'SangkaLearn',
                'slug' => 'leadnex-academy',
                'description' => 'Sertifikat resmi dari SangkaLearn untuk semua pelatihan digital',
                'code' => 'leadnex',
                'color' => '#2A7C82', // Petrol
                'is_active' => true,
                'order' => 1,
            ],
            [
                'name' => 'BNSP',
                'slug' => 'bnsp',
                'description' => 'Badan Nasional Sertifikasi Profesi - Sertifikasi profesi berlisensi nasional',
                'code' => 'bnsp',
                'color' => '#10B981', // Green
                'is_active' => true,
                'order' => 2,
            ],
            [
                'name' => 'ProBISDI',
                'slug' => 'probisdi',
                'description' => 'Profesional Business Digital Indonesia - Sertifikasi profesional untuk bidang bisnis digital',
                'code' => 'probisdi',
                'color' => '#8B5CF6', // Purple
                'is_active' => true,
                'order' => 3,
            ],
            [
                'name' => 'LSPKS',
                'slug' => 'lspks',
                'description' => 'Lembaga Sertifikasi Profesi Keuangan Syariah',
                'code' => 'lspks',
                'color' => '#F59E0B', // Amber
                'is_active' => true,
                'order' => 4,
            ],
            [
                'name' => 'BSMR',
                'slug' => 'bsmr',
                'description' => 'Badan Sertifikasi Manajemen Risiko',
                'code' => 'bsmr',
                'color' => '#EF4444', // Red
                'is_active' => true,
                'order' => 5,
            ],
        ];

        foreach ($providers as $provider) {
            CertificateProvider::updateOrCreate(
                ['code' => $provider['code']],
                $provider
            );
        }

        $this->command->info('Certificate providers seeded successfully!');
    }
}
