<?php

namespace Sitebound\LocationAuth\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Sitebound\LocationAuth\Http\Requests\UpdateLocationAccessRequest;
use Sitebound\LocationAuth\Models\LocationLoginSetting;
use Sitebound\LocationAuth\Support\LocationAccessViewData;

class LocationAccessController
{
    /**
     * Show the location access settings page.
     */
    public function edit(LocationAccessViewData $viewData): Response
    {
        return Inertia::render(
            (string) config('location-auth.frontend.components.settings', 'settings/LocationAccess'),
            $viewData->settings(),
        );
    }

    /**
     * Update the location access settings.
     */
    public function update(UpdateLocationAccessRequest $request): RedirectResponse
    {
        $locationAccess = LocationLoginSetting::query()->firstOrNew();
        $validated = $request->validated();

        $locationAccess->fill([
            'is_enabled' => $validated['is_enabled'],
            'latitude' => $validated['latitude'] ?? null,
            'longitude' => $validated['longitude'] ?? null,
            'radius_meters' => $validated['radius_meters'],
            'updated_by_user_id' => $request->user()?->getAuthIdentifier(),
        ]);

        $locationAccess->save();

        return to_route('location-access.edit');
    }
}
