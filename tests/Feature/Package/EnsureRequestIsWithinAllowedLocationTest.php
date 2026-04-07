<?php

namespace Tests\Feature\Package;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Sitebound\LocationAuth\Actions\EnsureRequestIsWithinAllowedLocation;
use Sitebound\LocationAuth\Exceptions\LocationAccessDeniedException;
use Sitebound\LocationAuth\Models\LocationLoginSetting;
use Tests\TestCase;

class EnsureRequestIsWithinAllowedLocationTest extends TestCase
{
    use RefreshDatabase;

    public function test_disabled_location_access_allows_requests_without_location_payload(): void
    {
        LocationLoginSetting::query()->create([
            'is_enabled' => false,
            'radius_meters' => 200,
        ]);

        app(EnsureRequestIsWithinAllowedLocation::class)->handle(
            Request::create('/login', 'POST', []),
        );

        $this->addToAssertionCount(1);
    }

    public function test_request_inside_the_geofence_is_allowed(): void
    {
        $this->enableLocationAccess();

        app(EnsureRequestIsWithinAllowedLocation::class)->handle(
            Request::create('/login', 'POST', $this->locationPayload()),
        );

        $this->addToAssertionCount(1);
    }

    public function test_request_outside_the_geofence_is_rejected(): void
    {
        $this->enableLocationAccess();

        $this->expectException(LocationAccessDeniedException::class);

        app(EnsureRequestIsWithinAllowedLocation::class)->handle(
            Request::create('/login', 'POST', $this->locationPayload([
                'latitude' => 14.6035123,
            ])),
        );
    }

    public function test_stale_location_payload_is_rejected(): void
    {
        $this->enableLocationAccess();

        $this->expectException(LocationAccessDeniedException::class);

        app(EnsureRequestIsWithinAllowedLocation::class)->handle(
            Request::create('/login', 'POST', $this->locationPayload([
                'captured_at' => now()->subMinutes(5)->toIso8601String(),
            ])),
        );
    }

    private function enableLocationAccess(): LocationLoginSetting
    {
        return LocationLoginSetting::query()->create([
            'is_enabled' => true,
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
