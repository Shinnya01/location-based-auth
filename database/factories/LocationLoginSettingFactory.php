<?php

namespace Database\Factories;

use App\Models\LocationLoginSetting;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LocationLoginSetting>
 */
class LocationLoginSettingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'is_enabled' => false,
            'latitude' => fake()->latitude(),
            'longitude' => fake()->longitude(),
            'radius_meters' => config('location-auth.default_radius_meters'),
            'updated_by_user_id' => User::factory(),
        ];
    }

    /**
     * Indicate that location-based login is enabled.
     */
    public function enabled(): static
    {
        return $this->state(fn () => [
            'is_enabled' => true,
        ]);
    }
}
