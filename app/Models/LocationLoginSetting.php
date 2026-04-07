<?php

namespace App\Models;

use Database\Factories\LocationLoginSettingFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Sitebound\LocationAuth\Models\LocationLoginSetting as BaseLocationLoginSetting;

class LocationLoginSetting extends BaseLocationLoginSetting
{
    /** @use HasFactory<LocationLoginSettingFactory> */
    use HasFactory;

    /**
     * Create a new factory instance for the model.
     */
    protected static function newFactory(): LocationLoginSettingFactory
    {
        return LocationLoginSettingFactory::new();
    }
}
