<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use App\Models\Conversation;
use App\Models\Message;

class TestMessagesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get users with different roles
        $adminUser = User::whereHas('roles', function($q) {
            $q->where('name', 'admin');
        })->first();

        $instructorUser = User::whereHas('roles', function($q) {
            $q->where('name', 'instructor');
        })->first();

        $studentUser = User::whereHas('roles', function($q) {
            $q->where('name', 'student');
        })->first();

        if (!$adminUser || !$instructorUser || !$studentUser) {
            $this->command->error('Missing required users with roles. Please run UserSeeder first.');
            return;
        }

        // Create test conversations
        $this->createTestConversation(
            'Course Assignment Discussion',
            [$adminUser, $instructorUser],
            [
                ['user' => $adminUser, 'content' => 'Hi! I wanted to discuss the new course assignments for this semester.'],
                ['user' => $instructorUser, 'content' => 'Hello! Yes, I have some ideas about the curriculum updates.'],
                ['user' => $adminUser, 'content' => 'Great! Let\'s schedule a meeting to discuss this further.'],
            ]
        );

        $this->createTestConversation(
            'Student Progress Review',
            [$instructorUser, $studentUser],
            [
                ['user' => $instructorUser, 'content' => 'Hi! I wanted to check on your progress with the recent assignments.'],
                ['user' => $studentUser, 'content' => 'Hello! I\'m doing well with most assignments, but I need help with the React component.'],
                ['user' => $instructorUser, 'content' => 'No problem! Let me know what specific issues you\'re facing.'],
                ['user' => $studentUser, 'content' => 'I\'m having trouble with state management in React hooks.'],
            ]
        );

        $this->createTestConversation(
            'System Updates Notification',
            [$adminUser, $studentUser],
            [
                ['user' => $adminUser, 'content' => 'Hello! There will be system maintenance this weekend.'],
                ['user' => $studentUser, 'content' => 'Thank you for the notice! Will this affect access to course materials?'],
                ['user' => $adminUser, 'content' => 'The maintenance will be from 2 AM to 6 AM, so it shouldn\'t affect your study schedule.'],
            ]
        );

        $this->createTestConversation(
            'Group Study Discussion',
            [$adminUser, $instructorUser, $studentUser],
            [
                ['user' => $studentUser, 'content' => 'Hi everyone! I was thinking about organizing study groups for the upcoming exam.'],
                ['user' => $instructorUser, 'content' => 'That\'s a great idea! I can provide additional study materials.'],
                ['user' => $adminUser, 'content' => 'I can help arrange meeting rooms for your study sessions.'],
                ['user' => $studentUser, 'content' => 'Thank you both! This will really help with exam preparation.'],
            ]
        );

        $this->command->info('Test conversations created successfully!');
    }

    private function createTestConversation(string $subject, array $participants, array $messages)
    {
        // Create conversation
        $conversation = Conversation::create([
            'subject' => $subject,
            'last_message_at' => now(),
        ]);

        // Add participants
        foreach ($participants as $participant) {
            $conversation->participants()->attach($participant->id, [
                'last_read_at' => null, // Unread for testing
            ]);
        }

        // Create messages
        foreach ($messages as $index => $messageData) {
            $message = $conversation->messages()->create([
                'user_id' => $messageData['user']->id,
                'content' => $messageData['content'],
                'created_at' => now()->subMinutes(count($messages) - $index), // Stagger message times
            ]);
        }

        // Update last message time
        $conversation->update([
            'last_message_at' => $conversation->messages()->latest()->first()->created_at
        ]);
    }
}