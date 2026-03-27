<?php

namespace Tests\Feature\Auth;

use App\Models\LocationLoginSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use Laravel\Fortify\Features;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_screen_can_be_rendered(): void
    {
        $response = $this->get(route('login'));

        $response
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('auth/Login')
                ->where('locationAccess.isEnabled', false),
            );
    }

    public function test_location_access_denied_screen_can_be_rendered(): void
    {
        $this->get(route('location-access-denied'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('auth/LocationAccessDenied'),
            );
    }

    public function test_users_can_authenticate_using_the_login_screen(): void
    {
        $user = User::factory()->create();

        $response = $this->post(route('login.store'), [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_users_can_authenticate_when_location_access_is_disabled(): void
    {
        LocationLoginSetting::factory()->create([
            'is_enabled' => false,
            'latitude' => 14.5995123,
            'longitude' => 120.9842222,
            'radius_meters' => 200,
            'updated_by_user_id' => null,
        ]);

        $user = User::factory()->create();

        $response = $this->post(route('login.store'), [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_users_can_authenticate_with_location_access_when_inside_geofence(): void
    {
        $this->enableLocationAccess();

        $user = User::factory()->create();

        $response = $this->post(route('login.store'), array_merge([
            'email' => $user->email,
            'password' => 'password',
        ], $this->locationPayload()));

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_users_with_two_factor_enabled_are_redirected_to_two_factor_challenge_when_inside_geofence(): void
    {
        $this->skipUnlessFortifyFeature(Features::twoFactorAuthentication());

        $this->enableLocationAccess();

        $user = User::factory()->withTwoFactor()->create();

        $response = $this->post(route('login.store'), array_merge([
            'email' => $user->email,
            'password' => 'password',
        ], $this->locationPayload()));

        $response->assertRedirect(route('two-factor.login'));
        $response->assertSessionHas('login.id', $user->id);
        $this->assertGuest();
    }

    public function test_users_outside_the_geofence_cannot_authenticate(): void
    {
        $this->enableLocationAccess();

        $user = User::factory()->create();

        $response = $this->from(route('login'))
            ->post(route('login.store'), array_merge([
                'email' => $user->email,
                'password' => 'password',
            ], $this->locationPayload([
                'latitude' => 14.6035123,
            ])));

        $response
            ->assertRedirect(route('location-access-denied'));

        $this->assertGuest();
    }

    public function test_users_without_location_payload_cannot_authenticate_when_location_access_is_enabled(): void
    {
        $this->enableLocationAccess();

        $user = User::factory()->create();

        $response = $this->from(route('login'))
            ->post(route('login.store'), [
                'email' => $user->email,
                'password' => 'password',
            ]);

        $response
            ->assertRedirect(route('location-access-denied'));

        $this->assertGuest();
    }

    public function test_users_with_stale_location_payload_cannot_authenticate(): void
    {
        $this->enableLocationAccess();

        $user = User::factory()->create();

        $response = $this->from(route('login'))
            ->post(route('login.store'), array_merge([
                'email' => $user->email,
                'password' => 'password',
            ], $this->locationPayload([
                'captured_at' => now()->subMinutes(5)->toIso8601String(),
            ])));

        $response
            ->assertRedirect(route('location-access-denied'));

        $this->assertGuest();
    }

    public function test_users_with_imprecise_location_payload_cannot_authenticate(): void
    {
        $this->enableLocationAccess();

        $user = User::factory()->create();

        $response = $this->from(route('login'))
            ->post(route('login.store'), array_merge([
                'email' => $user->email,
                'password' => 'password',
            ], $this->locationPayload([
                'accuracy' => 250,
            ])));

        $response
            ->assertRedirect(route('location-access-denied'));

        $this->assertGuest();
    }

    public function test_admin_users_outside_the_geofence_are_redirected_to_the_location_access_denied_page(): void
    {
        $this->enableLocationAccess();

        $user = User::factory()->admin()->create();

        $response = $this->from(route('login'))
            ->post(route('login.store'), array_merge([
                'email' => $user->email,
                'password' => 'password',
            ], $this->locationPayload([
                'latitude' => 14.6035123,
            ])));

        $response->assertRedirect(route('location-access-denied'));
        $this->assertGuest();
    }

    public function test_users_can_not_authenticate_with_invalid_password(): void
    {
        $user = User::factory()->create();

        $this->post(route('login.store'), [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        $this->assertGuest();
    }

    public function test_users_can_logout(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('logout'));

        $this->assertGuest();
        $response->assertRedirect(route('home'));
    }

    public function test_users_are_rate_limited(): void
    {
        $user = User::factory()->create();

        RateLimiter::increment(
            md5('login'.Str::transliterate(Str::lower($user->email).'|127.0.0.1')),
            amount: 5,
        );

        $response = $this->post(route('login.store'), [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        $this->assertSame(429, $response->baseResponse->getStatusCode());
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
