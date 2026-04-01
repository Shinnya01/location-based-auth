<?php

namespace Sitebound\LocationAuth\Support;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use Sitebound\LocationAuth\Models\LocationLoginSetting;

class LocationAccessViewData
{
    /**
     * Build the login page data.
     *
     * @return array<string, mixed>
     */
    public function login(Request $request): array
    {
        return [
            'canResetPassword' => Route::has('password.request'),
            'canRegister' => Features::enabled(Features::registration()) && Route::has('register'),
            'forgotPasswordUrl' => Route::has('password.request') ? route('password.request') : null,
            'registerUrl' => Features::enabled(Features::registration()) && Route::has('register')
                ? route('register')
                : null,
            'status' => $request->session()->get('status'),
            'submitUrl' => Route::has('login.store') ? route('login.store') : '/login',
            'locationAccess' => $this->auth(),
        ];
    }

    /**
     * Build the register page data.
     *
     * @return array<string, mixed>
     */
    public function register(): array
    {
        return [
            'loginUrl' => Route::has('login') ? route('login') : '/login',
            'submitUrl' => Route::has('register.store') ? route('register.store') : '/register',
            'locationAccess' => $this->auth(),
        ];
    }

    /**
     * Build the shared auth page location data.
     *
     * @return array<string, bool|float|int|string|null>
     */
    public function auth(): array
    {
        $setting = LocationLoginSetting::query()->first();

        return [
            'isEnabled' => $setting?->is_enabled === true && $setting->isConfigured(),
            'latitude' => $setting?->latitude,
            'longitude' => $setting?->longitude,
            'radiusMeters' => $setting?->radius_meters ?? config('location-auth.default_radius_meters'),
            'maxAgeSeconds' => config('location-auth.max_age_seconds'),
            'deniedUrl' => Route::has('location-access-denied')
                ? route('location-access-denied')
                : '/location-access-denied',
        ];
    }

    /**
     * Build the settings page data.
     *
     * @return array<string, mixed>
     */
    public function settings(): array
    {
        $setting = LocationLoginSetting::query()->first();

        return [
            'updateUrl' => Route::has('location-access.update')
                ? route('location-access.update')
                : '/settings/location-access',
            'locationAccess' => [
                'isEnabled' => $setting?->is_enabled ?? false,
                'latitude' => $setting?->latitude,
                'longitude' => $setting?->longitude,
                'radiusMeters' => $setting?->radius_meters ?? config('location-auth.default_radius_meters'),
                'maxRadiusMeters' => config('location-auth.max_radius_meters'),
                'updatedAt' => $setting?->updated_at?->toIso8601String(),
            ],
        ];
    }
}
