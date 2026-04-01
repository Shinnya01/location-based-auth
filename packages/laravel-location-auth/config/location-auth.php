<?php

return [
    'default_radius_meters' => 200,
    'max_radius_meters' => 100000,
    'max_age_seconds' => 60,

    'fortify' => [
        'register_views' => true,
        'middleware_group' => 'web',
        'route_names' => [
            'login.store',
            'register.store',
        ],
    ],

    'frontend' => [
        'stack' => 'inertia-vue',
        'components' => [
            'login' => 'auth/Login',
            'register' => 'auth/Register',
            'denied' => 'auth/LocationAccessDenied',
            'settings' => 'settings/LocationAccess',
        ],
    ],

    'routes' => [
        'register' => true,
        'denied_path' => 'location-access-denied',
        'settings_path' => 'settings/location-access',
        'public_middleware' => ['web'],
        'settings_middleware' => ['web', 'auth', 'verified'],
        'settings_gate' => 'manage-location-auth',
    ],
];
