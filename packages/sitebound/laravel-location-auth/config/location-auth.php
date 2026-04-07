<?php

use App\Models\User;

return [
    'default_radius_meters' => 200,
    'max_radius_meters' => 100000,
    'max_age_seconds' => 60,
    'user_model' => User::class,
    'denied_route_name' => 'location-access-denied',
];
