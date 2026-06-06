<?php

namespace Database\Seeders;

use App\Models\CourseType;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CourseTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // HAPUS semua data lama
        CourseType::query()->delete();

        // ========================================
        // 1. PARENT CATEGORIES (5 Kategori Induk)
        // ========================================

        $parents = [
            [
                'name' => 'Sertifikat LSP Berlisensi BNSP (tanpa gelar profesional)',
                'slug' => 'lsp-bnsp-tanpa-gelar',
                'description' => 'Sertifikat LSP berlisensi BNSP tanpa gelar profesional',
                'color' => '#10B981', // Green
                'icon' => 'Award',
                'is_active' => true,
                'order' => 1,
            ],
            [
                'name' => 'Sertifikat LSP Berlisensi BNSP (dengan gelar profesional)',
                'slug' => 'lsp-bnsp-dengan-gelar',
                'description' => 'Sertifikat LSP berlisensi BNSP dengan gelar profesional',
                'color' => '#059669', // Dark Green
                'icon' => 'Trophy',
                'is_active' => true,
                'order' => 2,
            ],
            [
                'name' => 'Sertifikat LNA dengan Gelar Profesional dari ProBISDI',
                'slug' => 'lna-probisdi',
                'description' => 'Sertifikat LNA dengan Gelar Profesional dari ProBISDI (Non BNSP)',
                'color' => '#8B5CF6', // Purple
                'icon' => 'GraduationCap',
                'is_active' => true,
                'order' => 3,
            ],
            [
                'name' => 'Pelatihan Teknologi Bisnis Digital',
                'slug' => 'teknologi-bisnis-digital',
                'description' => 'Pelatihan Teknologi Bisnis Digital',
                'color' => '#0EA5E9', // Sky Blue
                'icon' => 'Monitor',
                'is_active' => true,
                'order' => 4,
            ],
            [
                'name' => 'Pelatihan Umum Untuk Semua Industri',
                'slug' => 'pelatihan-umum',
                'description' => 'Pelatihan Umum Untuk Semua Industri',
                'color' => '#6B7280', // Gray
                'icon' => 'Briefcase',
                'is_active' => true,
                'order' => 5,
            ],
        ];

        foreach ($parents as $parentData) {
            CourseType::create($parentData);
        }

        // Get parent IDs for reference
        $parentLspTanpaGelar = CourseType::where('slug', 'lsp-bnsp-tanpa-gelar')->first();
        $parentLspDenganGelar = CourseType::where('slug', 'lsp-bnsp-dengan-gelar')->first();
        $parentProBISDI = CourseType::where('slug', 'lna-probisdi')->first();
        $parentTeknologi = CourseType::where('slug', 'teknologi-bisnis-digital')->first();
        $parentUmum = CourseType::where('slug', 'pelatihan-umum')->first();

        // ========================================
        // 2. CHILDREN - Sertifikat LSP BNSP (tanpa gelar) - 2 items
        // ========================================
        $childrenLspTanpaGelar = [
            [
                'parent_id' => $parentLspTanpaGelar->id,
                'name' => 'Sertifikat LSP BNSP - Manajemen Risiko BSMR',
                'slug' => 'lsp-bnsp-bsmr',
                'description' => 'Pembekalan Sertifikasi Manajemen Risiko Jenjang 4 BSMR (Untuk Perbankan Konvensional)',
                'color' => '#10B981',
                'icon' => 'Award',
                'is_active' => true,
                'order' => 1,
            ],
            [
                'parent_id' => $parentLspTanpaGelar->id,
                'name' => 'Sertifikat LSP BNSP - Manajemen Risiko LSPKS',
                'slug' => 'lsp-bnsp-lspks',
                'description' => 'Pembekalan Sertifikasi Manajemen Risiko Jenjang 4 LSPKS (Untuk Perbankan Syariah)',
                'color' => '#10B981',
                'icon' => 'Award',
                'is_active' => true,
                'order' => 2,
            ],
        ];

        // ========================================
        // 3. CHILDREN - Sertifikat LSP BNSP (dengan gelar) - 3 items
        // ========================================
        $childrenLspDenganGelar = [
            [
                'parent_id' => $parentLspDenganGelar->id,
                'name' => 'Sertifikat LSP BNSP - CHRO',
                'slug' => 'lsp-bnsp-chro',
                'description' => 'Certified Human Resource Operational (Dengan Gelar Profesional CHRO)',
                'color' => '#059669',
                'icon' => 'Users',
                'is_active' => true,
                'order' => 1,
            ],
            [
                'parent_id' => $parentLspDenganGelar->id,
                'name' => 'Sertifikat LSP BNSP - GRCO',
                'slug' => 'lsp-bnsp-grco',
                'description' => 'Certified Governance, Risk, Compliance Operation (Dengan Gelar Profesional GRCO)',
                'color' => '#059669',
                'icon' => 'Shield',
                'is_active' => true,
                'order' => 2,
            ],
            [
                'parent_id' => $parentLspDenganGelar->id,
                'name' => 'Sertifikat LSP BNSP - CRA',
                'slug' => 'lsp-bnsp-cra',
                'description' => 'Certified Risk Associate (Dengan Gelar Profesional CRA)',
                'color' => '#059669',
                'icon' => 'Target',
                'is_active' => true,
                'order' => 3,
            ],
        ];

        // ========================================
        // 4. CHILDREN - Sertifikat ProBISDI - 11 items
        // ========================================
        $childrenProBISDI = [
            [
                'parent_id' => $parentProBISDI->id,
                'name' => 'Sertifikat ProBISDI - Certified AI For Business',
                'slug' => 'probisdi-ai-business',
                'description' => 'Sertifikasi ProBISDI dengan Gelar Profesional: Certified AI For Business',
                'color' => '#8B5CF6',
                'icon' => 'Rocket',
                'is_active' => true,
                'order' => 1,
            ],
            [
                'parent_id' => $parentProBISDI->id,
                'name' => 'Sertifikat ProBISDI - Certified AI Digital Marketing',
                'slug' => 'probisdi-ai-marketing',
                'description' => 'Sertifikasi ProBISDI dengan Gelar Profesional: Certified AI Digital Marketing',
                'color' => '#8B5CF6',
                'icon' => 'TrendingUp',
                'is_active' => true,
                'order' => 2,
            ],
            [
                'parent_id' => $parentProBISDI->id,
                'name' => 'Sertifikat ProBISDI - Certified Digital Business Model',
                'slug' => 'probisdi-business-model',
                'description' => 'Sertifikasi ProBISDI dengan Gelar Profesional: Certified Digital Business Model',
                'color' => '#8B5CF6',
                'icon' => 'Building',
                'is_active' => true,
                'order' => 3,
            ],
            [
                'parent_id' => $parentProBISDI->id,
                'name' => 'Sertifikat ProBISDI - Certified Business Risk',
                'slug' => 'probisdi-business-risk',
                'description' => 'Sertifikasi ProBISDI dengan Gelar Profesional: Certified Business Risk',
                'color' => '#8B5CF6',
                'icon' => 'Shield',
                'is_active' => true,
                'order' => 4,
            ],
            [
                'parent_id' => $parentProBISDI->id,
                'name' => 'Sertifikat ProBISDI - Certified Portfolio Manager',
                'slug' => 'probisdi-portfolio-manager',
                'description' => 'Sertifikasi ProBISDI dengan Gelar Profesional: Certified Portfolio Manager',
                'color' => '#8B5CF6',
                'icon' => 'Target',
                'is_active' => true,
                'order' => 5,
            ],
            [
                'parent_id' => $parentProBISDI->id,
                'name' => 'Sertifikat ProBISDI - Certified Business Intelligence Analyst',
                'slug' => 'probisdi-bi-analyst',
                'description' => 'Sertifikasi ProBISDI dengan Gelar Profesional: Certified Business Intelligence Analyst',
                'color' => '#8B5CF6',
                'icon' => 'Monitor',
                'is_active' => true,
                'order' => 6,
            ],
            [
                'parent_id' => $parentProBISDI->id,
                'name' => 'Sertifikat ProBISDI - Certified Digital Finance',
                'slug' => 'probisdi-digital-finance',
                'description' => 'Sertifikasi ProBISDI dengan Gelar Profesional: Certified Digital Finance',
                'color' => '#8B5CF6',
                'icon' => 'DollarSign',
                'is_active' => true,
                'order' => 7,
            ],
            [
                'parent_id' => $parentProBISDI->id,
                'name' => 'Sertifikat ProBISDI - Certified Digital Law',
                'slug' => 'probisdi-digital-law',
                'description' => 'Sertifikasi ProBISDI dengan Gelar Profesional: Certified Digital Law',
                'color' => '#8B5CF6',
                'icon' => 'Scale',
                'is_active' => true,
                'order' => 8,
            ],
            [
                'parent_id' => $parentProBISDI->id,
                'name' => 'Sertifikat ProBISDI - Certified Backend Engineer',
                'slug' => 'probisdi-backend-engineer',
                'description' => 'Sertifikasi ProBISDI dengan Gelar Profesional: Certified Backend Engineer',
                'color' => '#8B5CF6',
                'icon' => 'Code',
                'is_active' => true,
                'order' => 9,
            ],
            [
                'parent_id' => $parentProBISDI->id,
                'name' => 'Sertifikat ProBISDI - Certified Front End Engineer',
                'slug' => 'probisdi-frontend-engineer',
                'description' => 'Sertifikasi ProBISDI dengan Gelar Profesional: Certified Front End Engineer',
                'color' => '#8B5CF6',
                'icon' => 'Layout',
                'is_active' => true,
                'order' => 10,
            ],
            [
                'parent_id' => $parentProBISDI->id,
                'name' => 'Sertifikat ProBISDI - Certified Digital Transformation Planner',
                'slug' => 'probisdi-transformation-planner',
                'description' => 'Sertifikasi ProBISDI dengan Gelar Profesional: Certified Digital Transformation Planner',
                'color' => '#8B5CF6',
                'icon' => 'Zap',
                'is_active' => true,
                'order' => 11,
            ],
        ];

        // ========================================
        // 5. CHILDREN - Pelatihan Teknologi - 4 items
        // ========================================
        $childrenTeknologi = [
            [
                'parent_id' => $parentTeknologi->id,
                'name' => 'Pelatihan Teknologi - Full-Stack Developer Bootcamp',
                'slug' => 'teknologi-fullstack-bootcamp',
                'description' => 'Full-Stack Developer Bootcamp (Laravel, React, PostgreSQL)',
                'color' => '#0EA5E9',
                'icon' => 'Monitor',
                'is_active' => true,
                'order' => 1,
            ],
            [
                'parent_id' => $parentTeknologi->id,
                'name' => 'Pelatihan Teknologi - Data Engineering',
                'slug' => 'teknologi-data-engineering',
                'description' => 'Data Engineering with Python & SQL',
                'color' => '#0EA5E9',
                'icon' => 'Database',
                'is_active' => true,
                'order' => 2,
            ],
            [
                'parent_id' => $parentTeknologi->id,
                'name' => 'Pelatihan Teknologi - Machine Learning & MLOps',
                'slug' => 'teknologi-mlops',
                'description' => 'Machine Learning Engineering & MLOps Basic',
                'color' => '#0EA5E9',
                'icon' => 'Cpu',
                'is_active' => true,
                'order' => 3,
            ],
            [
                'parent_id' => $parentTeknologi->id,
                'name' => 'Pelatihan Teknologi - AI Application Development',
                'slug' => 'teknologi-ai-app',
                'description' => 'AI Application Development (NLP, CV, LLM Integration)',
                'color' => '#0EA5E9',
                'icon' => 'Rocket',
                'is_active' => true,
                'order' => 4,
            ],
        ];

        // ========================================
        // 6. CHILDREN - Pelatihan Umum - 10 items
        // ========================================
        $childrenUmum = [
            [
                'parent_id' => $parentUmum->id,
                'name' => 'Pelatihan Umum - Climate Risk Management',
                'slug' => 'umum-climate-risk',
                'description' => 'Climate Risk Management System',
                'color' => '#6B7280',
                'icon' => 'Leaf',
                'is_active' => true,
                'order' => 1,
            ],
            [
                'parent_id' => $parentUmum->id,
                'name' => 'Pelatihan Umum - Corporate Plan Berbasis Risiko',
                'slug' => 'umum-corporate-plan',
                'description' => 'Corporate Plan Berbasis Risiko',
                'color' => '#6B7280',
                'icon' => 'Target',
                'is_active' => true,
                'order' => 2,
            ],
            [
                'parent_id' => $parentUmum->id,
                'name' => 'Pelatihan Umum - Sustainability Reporting',
                'slug' => 'umum-sustainability',
                'description' => 'Sustainability Reporting',
                'color' => '#6B7280',
                'icon' => 'FileText',
                'is_active' => true,
                'order' => 3,
            ],
            [
                'parent_id' => $parentUmum->id,
                'name' => 'Pelatihan Umum - Digital Anti Fraud',
                'slug' => 'umum-anti-fraud',
                'description' => 'Digital Anti Fraud',
                'color' => '#6B7280',
                'icon' => 'Shield',
                'is_active' => true,
                'order' => 4,
            ],
            [
                'parent_id' => $parentUmum->id,
                'name' => 'Pelatihan Umum - Digital Awareness',
                'slug' => 'umum-digital-awareness',
                'description' => 'Digital Awareness',
                'color' => '#6B7280',
                'icon' => 'Eye',
                'is_active' => true,
                'order' => 5,
            ],
            [
                'parent_id' => $parentUmum->id,
                'name' => 'Pelatihan Umum - Risk Culture & Fraud Awareness',
                'slug' => 'umum-risk-culture',
                'description' => 'Risk Culture dan Fraud Awareness',
                'color' => '#6B7280',
                'icon' => 'AlertCircle',
                'is_active' => true,
                'order' => 6,
            ],
            [
                'parent_id' => $parentUmum->id,
                'name' => 'Pelatihan Umum - Leadership & Performance',
                'slug' => 'umum-leadership',
                'description' => 'Leadership & Performance',
                'color' => '#6B7280',
                'icon' => 'Users',
                'is_active' => true,
                'order' => 7,
            ],
            [
                'parent_id' => $parentUmum->id,
                'name' => 'Pelatihan Umum - Carbon Finance',
                'slug' => 'umum-carbon-finance',
                'description' => 'Carbon Finance',
                'color' => '#6B7280',
                'icon' => 'DollarSign',
                'is_active' => true,
                'order' => 8,
            ],
            [
                'parent_id' => $parentUmum->id,
                'name' => 'Pelatihan Umum - Financial Engineering',
                'slug' => 'umum-financial-engineering',
                'description' => 'Financial Engineering dalam Kredit dan Investasi',
                'color' => '#6B7280',
                'icon' => 'TrendingUp',
                'is_active' => true,
                'order' => 9,
            ],
            [
                'parent_id' => $parentUmum->id,
                'name' => 'Pelatihan Umum - Implementasi ERM',
                'slug' => 'umum-erm',
                'description' => 'Implementasi ERM Untuk Berbagai Industri',
                'color' => '#6B7280',
                'icon' => 'Shield',
                'is_active' => true,
                'order' => 10,
            ],
        ];

        // Insert all children
        foreach ($childrenLspTanpaGelar as $child) {
            CourseType::create($child);
        }

        foreach ($childrenLspDenganGelar as $child) {
            CourseType::create($child);
        }

        foreach ($childrenProBISDI as $child) {
            CourseType::create($child);
        }

        foreach ($childrenTeknologi as $child) {
            CourseType::create($child);
        }

        foreach ($childrenUmum as $child) {
            CourseType::create($child);
        }

        $this->command->info('Course types seeded successfully with parent-child structure!');
        $this->command->info('Total parents: 5');
        $this->command->info('Total children: 30 (2 + 3 + 11 + 4 + 10)');
    }
}
