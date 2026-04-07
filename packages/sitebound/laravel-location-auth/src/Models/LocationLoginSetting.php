<?php

namespace Sitebound\LocationAuth\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'is_enabled',
    'latitude',
    'longitude',
    'radius_meters',
    'updated_by_user_id',
])]
class LocationLoginSetting extends Model
{
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_enabled' => 'boolean',
            'latitude' => 'float',
            'longitude' => 'float',
            'radius_meters' => 'integer',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Determine if the location login setting has a usable geofence.
     */
    public function isConfigured(): bool
    {
        return $this->latitude !== null
            && $this->longitude !== null
            && $this->radius_meters > 0;
    }

    /**
     * Get the user that last updated the location login setting.
     */
    public function updatedBy(): BelongsTo
    {
        /** @var class-string<Model> $userModel */
        $userModel = config('location-auth.user_model');

        return $this->belongsTo($userModel, 'updated_by_user_id');
    }
}
