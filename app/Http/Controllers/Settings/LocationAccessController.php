<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\LocationAccessUpdateRequest;
use App\Models\LocationLoginSetting;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class LocationAccessController extends Controller
{
    /**
     * Show the location access settings page.
     */
    public function edit(): Response
    {
        $setting = LocationLoginSetting::query()->first();

        return Inertia::render('settings/LocationAccess', [
            'locationAccess' => [
                'isEnabled' => $setting?->is_enabled ?? false,
                'latitude' => $setting?->latitude,
                'longitude' => $setting?->longitude,
                'radiusMeters' => $setting?->radius_meters ?? config('location-auth.default_radius_meters'),
                'maxRadiusMeters' => config('location-auth.max_radius_meters'),
                'updatedAt' => $setting?->updated_at?->toIso8601String(),
            ],
        ]);
    }

    /**
     * Update the location access settings.
     */
    public function update(LocationAccessUpdateRequest $request): RedirectResponse
    {
        $locationAccess = LocationLoginSetting::query()->firstOrNew();
        $validated = $request->validated();

        $locationAccess->fill([
            'is_enabled' => $validated['is_enabled'],
            'latitude' => $validated['latitude'] ?? null,
            'longitude' => $validated['longitude'] ?? null,
            'radius_meters' => $validated['radius_meters'],
            'updated_by_user_id' => $request->user()->id,
        ]);

        $locationAccess->save();

        return to_route('location-access.edit');
    }
}
