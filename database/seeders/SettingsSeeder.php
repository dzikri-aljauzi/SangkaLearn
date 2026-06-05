<?php
// database/seeders/SettingsSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Setting;

class SettingsSeeder extends Seeder
{
    public function run()
    {
        $settings = [
            // General
            ['key' => 'site_name', 'value' => 'Modern LMS', 'group' => 'general', 'is_public' => true],
            ['key' => 'site_description', 'value' => 'Advanced Learning Management System', 'group' => 'general', 'is_public' => true],
            ['key' => 'site_logo', 'value' => '', 'group' => 'general', 'is_public' => true],
            ['key' => 'default_currency', 'value' => 'USD', 'group' => 'general'],
            ['key' => 'default_language', 'value' => 'en', 'group' => 'general'],
            
            // Course Settings
            ['key' => 'default_course_duration', 'value' => '8', 'group' => 'courses'],
            ['key' => 'max_upload_size', 'value' => '100', 'group' => 'courses'], // MB
            ['key' => 'allowed_video_formats', 'value' => '["mp4","webm","ogg"]', 'type' => 'json', 'group' => 'courses'],
            
            // Payment
            ['key' => 'instructor_commission', 'value' => '70', 'group' => 'payment'], // percentage
            ['key' => 'min_payout_amount', 'value' => '50', 'group' => 'payment'],
            ['key' => 'payment_methods', 'value' => '["stripe","paypal"]', 'type' => 'json', 'group' => 'payment'],
            
            // Email
            ['key' => 'mail_from_name', 'value' => 'Modern LMS', 'group' => 'email'],
            ['key' => 'mail_from_address', 'value' => 'noreply@modernlms.com', 'group' => 'email'],
            
            // Features
            ['key' => 'enable_certificates', 'value' => 'true', 'type' => 'boolean', 'group' => 'features'],
            ['key' => 'enable_forums', 'value' => 'true', 'type' => 'boolean', 'group' => 'features'],
            ['key' => 'enable_gamification', 'value' => 'true', 'type' => 'boolean', 'group' => 'features'],
            ['key' => 'enable_subscriptions', 'value' => 'false', 'type' => 'boolean', 'group' => 'features'],
        ];

        foreach ($settings as $setting) {
            Setting::create($setting);
        }
    }
}