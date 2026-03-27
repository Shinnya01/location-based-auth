<?php

namespace Tests\Feature\Auth;

use App\Models\LocationLoginSetting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Laravel\Fortify\Features;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->skipUnlessFortifyFeature(Features::registration());
    }

    public function test_registration_screen_can_be_rendered(): void
    {
        $response = $this->get(route('register'));

        $response
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('auth/Register')
                ->where('locationAccess.isEnabled', false),
            );
    }

    public function test_new_users_can_register(): void
    {
        $response = $this->post(route('register.store'), [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_new_users_can_register_with_location_access_when_inside_geofence(): void
    {
        $this->enableLocationAccess();

        $response = $this->post(route('register.store'), array_merge([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ], $this->locationPayload()));

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_new_users_outside_the_geofence_are_redirected_to_the_location_access_denied_page(): void
    {
        $this->enableLocationAccess();

        $response = $this->from(route('register'))
            ->post(route('register.store'), array_merge([
                'name' => 'Test User',
                'email' => 'test@example.com',
                'password' => 'password',
                'password_confirmation' => 'password',
            ], $this->locationPayload([
                'latitude' => 14.6035123,
            ])));

        $response->assertRedirect(route('location-access-denied'));
        $this->assertGuest();
    }

    public function test_new_users_without_location_payload_are_redirected_when_location_access_is_enabled(): void
    {
        $this->enableLocationAccess();

        $response = $this->from(route('register'))
            ->post(route('register.store'), [
                'name' => 'Test User',
                'email' => 'test@example.com',
                'password' => 'password',
                'password_confirmation' => 'password',
            ]);

        $response->assertRedirect(route('location-access-denied'));
        $this->assertGuest();
    }

    public function test_new_users_with_stale_location_payload_are_redirected_to_the_location_access_denied_page(): void
    {
        $this->enableLocationAccess();

        $response = $this->from(route('register'))
            ->post(route('register.store'), array_merge([
                'name' => 'Test User',
                'email' => 'test@example.com',
                'password' => 'password',
                'password_confirmation' => 'password',
            ], $this->locationPayload([
                'captured_at' => now()->subMinutes(5)->toIso8601String(),
            ])));

        $response->assertRedirect(route('location-access-denied'));
        $this->assertGuest();
    }

    public function test_new_users_with_imprecise_location_payload_are_redirected_to_the_location_access_denied_page(): void
    {
        $this->enableLocationAccess();

        $response = $this->from(route('register'))
            ->post(route('register.store'), array_merge([
                'name' => 'Test User',
                'email' => 'test@example.com',
                'password' => 'password',
                'password_confirmation' => 'password',
            ], $this->locationPayload([
                'accuracy' => 250,
            ])));

        $response->assertRedirect(route('location-access-denied'));
        $this->assertGuest();
    }

    private function enableLocationAccess(): LocationLoginSetting
    {
        return LocationLoginSetting::factory()->enabled()->create([
            'latitude' => 14.5995123,
            'longitude' => 120.9842222,
            'radius_meters' => 200,
            'updated_by_user_id' => null,
        ]);
    }

    /**
     * @param  array<string, float|string>  $overrides
     * @return array<string, float|string>
     */
    private function locationPayload(array $overrides = []): array
    {
        return array_merge([
            'latitude' => 14.5995123,
            'longitude' => 120.9842222,
            'accuracy' => 15.0,
            'captured_at' => now()->toIso8601String(),
        ], $overrides);
    }
}
