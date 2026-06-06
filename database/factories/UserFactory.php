<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'phone' => '+62' . fake()->numerify('81########'),
            'date_of_birth' => fake()->dateTimeBetween('-50 years', '-18 years')->format('Y-m-d'),
            'gender' => fake()->randomElement(['male', 'female', 'other']),
            'bio' => fake()->paragraph(2),
            'job_title' => fake()->jobTitle(),
            'company' => fake()->company(),
            'social_links' => [
                'linkedin' => 'https://linkedin.com/in/' . fake()->userName(),
                'twitter' => 'https://twitter.com/' . fake()->userName(),
            ],
            'timezone' => 'Asia/Jakarta',
            'language' => 'id',
            'is_active' => true,
            'last_login_at' => fake()->dateTimeBetween('-30 days', 'now'),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Indicate that the user is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Create admin user.
     */
    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'first_name' => 'Admin',
            'last_name' => 'User',
            'email' => 'admin@test.com',
            'job_title' => 'System Administrator',
            'company' => 'LMS BDI',
        ]);
    }

    /**
     * Create instructor user.
     */
    public function instructor(): static
    {
        return $this->state(fn (array $attributes) => [
            'job_title' => fake()->randomElement([
                'Senior Developer',
                'Digital Marketing Expert',
                'Data Scientist',
                'UI/UX Designer',
                'Business Analyst'
            ]),
            'bio' => 'Experienced professional with ' . fake()->numberBetween(5, 15) . '+ years in the industry.',
        ]);
    }

    /**
     * Create student user.
     */
    public function student(): static
    {
        return $this->state(fn (array $attributes) => [
            'job_title' => fake()->randomElement([
                'Fresh Graduate',
                'Junior Developer',
                'Marketing Assistant',
                'Sales Executive',
                'Content Creator'
            ]),
        ]);
    }
}