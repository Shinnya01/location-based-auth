<?php

namespace Sitebound\LocationAuth\Http\Controllers;

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class LocationAccessDeniedController
{
    /**
     * Display the denied screen.
     */
    public function __invoke(): Response
    {
        return Inertia::render(
            (string) config('location-auth.frontend.components.denied', 'auth/LocationAccessDenied'),
            [
                'loginUrl' => Route::has('login') ? route('login') : null,
                'registerUrl' => Features::enabled(Features::registration()) && Route::has('register')
                    ? route('register')
                    : null,
            ],
        );
    }
}
