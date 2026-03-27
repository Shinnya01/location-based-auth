<?php

namespace App\Actions\LocationAccess;

use App\Exceptions\LocationAccessDeniedException;
use App\Models\LocationLoginSetting;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class EnsureRequestIsWithinAllowedLocation
{
    /**
     * Ensure the current request is within the configured geofence.
     *
     * @throws LocationAccessDeniedException
     */
    public function handle(Request $request): void
    {
        $setting = LocationLoginSetting::query()->first();

        if (! $setting?->is_enabled || ! $setting->isConfigured()) {
            return;
        }

        $location = $this->validateLocationPayload($request);
        $capturedAt = CarbonImmutable::parse($location['captured_at']);

        if ($capturedAt->lt(now()->subSeconds(config('location-auth.max_age_seconds')))) {
            throw new LocationAccessDeniedException();
        }

        $distanceMeters = $this->distanceInMeters(
            (float) $location['latitude'],
            (float) $location['longitude'],
            $setting->latitude,
            $setting->longitude,
        );

        if ($distanceMeters + (float) $location['accuracy'] > $setting->radius_meters) {
            throw new LocationAccessDeniedException();
        }
    }

    /**
     * Validate the location payload from the current request.
     *
     * @return array<string, mixed>
     *
     * @throws LocationAccessDeniedException
     */
    private function validateLocationPayload(Request $request): array
    {
        $validator = Validator::make($request->all(), [
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'accuracy' => ['required', 'numeric', 'min:0', 'max:100000'],
            'captured_at' => ['required', 'date'],
        ]);

        if ($validator->fails()) {
            throw new LocationAccessDeniedException();
        }

        return $validator->validated();
    }

    /**
     * Calculate the distance between two coordinates in meters.
     */
    private function distanceInMeters(
        float $fromLatitude,
        float $fromLongitude,
        float $toLatitude,
        float $toLongitude,
    ): float {
        $earthRadiusMeters = 6371000;
        $latitudeDelta = deg2rad($toLatitude - $fromLatitude);
        $longitudeDelta = deg2rad($toLongitude - $fromLongitude);
        $fromLatitudeRadians = deg2rad($fromLatitude);
        $toLatitudeRadians = deg2rad($toLatitude);

        $a = sin($latitudeDelta / 2) ** 2
            + cos($fromLatitudeRadians) * cos($toLatitudeRadians) * sin($longitudeDelta / 2) ** 2;
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadiusMeters * $c;
    }
}
