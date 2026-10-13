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
                'name' => 'ProSangka',
                'slug' => 'prosangka',
                'description' => 'Profesional Business Digital Indonesia - Sertifikasi profesional untuk bidang bisnis digital',
                'code' => 'prosangka',
                'color' => '#8B5CF6', // Purple
                'is_active' => true,
                'order' => 3,
            ],
            [
                'name' => 'SAMUDRA',
                'slug' => 'samudra',
                'description' => 'Lembaga Sertifikasi Profesi Samudra Syariah',
                'code' => 'samudra',
                'color' => '#F59E0B', // Amber
                'is_active' => true,
                'order' => 4,
            ],
            [
                'name' => 'MANDALA',
                'slug' => 'mandala',
                'description' => 'Lembaga Sertifikasi Manajemen Risiko Mandala',
                'code' => 'mandala',
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
