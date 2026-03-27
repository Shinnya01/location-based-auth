<?php

namespace Tests\Feature\Settings;

use App\Models\LocationLoginSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class LocationAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_non_admin_cannot_view_the_location_access_page(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('location-access.edit'))
            ->assertForbidden();
    }

    public function test_non_admin_cannot_update_the_location_access_settings(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->put(route('location-access.update'), $this->validPayload())
            ->assertForbidden();

        $this->assertDatabaseCount('location_login_settings', 0);
    }

    public function test_admin_can_view_the_location_access_page(): void
    {
        $admin = User::factory()->admin()->create();
        $setting = LocationLoginSetting::factory()->enabled()->create([
            'latitude' => 14.5995123,
            'longitude' => 120.9842222,
            'radius_meters' => 200,
            'updated_by_user_id' => $admin->id,
        ]);

        $this->actingAs($admin)
            ->get(route('location-access.edit'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('settings/LocationAccess')
                ->where('locationAccess.isEnabled', true)
                ->where('locationAccess.latitude', $setting->latitude)
                ->where('locationAccess.longitude', $setting->longitude)
                ->where('locationAccess.radiusMeters', 200)
                ->where('locationAccess.maxRadiusMeters', config('location-auth.max_radius_meters'))
                ->where('locationAccess.updatedAt', $setting->updated_at?->toIso8601String()),
            );
    }

    public function test_admin_can_view_the_location_access_page_without_a_saved_location(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->get(route('location-access.edit'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('settings/LocationAccess')
                ->where('locationAccess.isEnabled', false)
                ->where('locationAccess.latitude', null)
                ->where('locationAccess.longitude', null)
                ->where('locationAccess.radiusMeters', config('location-auth.default_radius_meters'))
                ->where('locationAccess.maxRadiusMeters', config('location-auth.max_radius_meters'))
                ->where('locationAccess.updatedAt', null),
            );
    }

    public function test_admin_can_update_the_location_access_settings(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)
            ->put(route('location-access.update'), [
                'is_enabled' => true,
                'latitude' => '14.5995123',
                'longitude' => '120.9842222',
                'radius_meters' => 275,
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('location-access.edit'));

        $setting = LocationLoginSetting::query()->sole();

        $this->assertTrue($setting->is_enabled);
        $this->assertSame(14.5995123, $setting->latitude);
        $this->assertSame(120.9842222, $setting->longitude);
        $this->assertSame(275, $setting->radius_meters);
        $this->assertSame($admin->id, $setting->updated_by_user_id);
    }

    public function test_invalid_location_access_updates_are_rejected(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)
            ->from(route('location-access.edit'))
            ->put(route('location-access.update'), [
                'is_enabled' => true,
                'latitude' => '91',
                'longitude' => '',
                'radius_meters' => 0,
            ]);

        $response
            ->assertSessionHasErrors([
                'latitude',
                'longitude',
                'radius_meters',
            ])
            ->assertRedirect(route('location-access.edit'));

        $this->assertDatabaseCount('location_login_settings', 0);
    }

    /**
     * @return array<string, bool|int|string>
     */
    private function validPayload(): array
    {
        return [
            'is_enabled' => true,
            'latitude' => '14.5995123',
            'longitude' => '120.9842222',
            'radius_meters' => 200,
        ];
    }
}
