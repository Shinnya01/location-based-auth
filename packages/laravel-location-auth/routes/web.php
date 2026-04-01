<?php

use Illuminate\Support\Facades\Route;
use Sitebound\LocationAuth\Http\Controllers\LocationAccessController;
use Sitebound\LocationAuth\Http\Controllers\LocationAccessDeniedController;

if (! config('location-auth.routes.register', true)) {
    return;
}

$settingsMiddleware = array_values(array_filter([
    ...config('location-auth.routes.settings_middleware', ['web', 'auth', 'verified']),
    config('location-auth.routes.settings_gate')
        ? 'can:'.config('location-auth.routes.settings_gate')
        : null,
]));

Route::middleware(config('location-auth.routes.public_middleware', ['web']))->group(function (): void {
    Route::get(
        config('location-auth.routes.denied_path', 'location-access-denied'),
        LocationAccessDeniedController::class,
    )->name('location-access-denied');
});

Route::middleware($settingsMiddleware)->group(function (): void {
    Route::get(
        config('location-auth.routes.settings_path', 'settings/location-access'),
        [LocationAccessController::class, 'edit'],
    )->name('location-access.edit');

    Route::put(
        config('location-auth.routes.settings_path', 'settings/location-access'),
        [LocationAccessController::class, 'update'],
    )->name('location-access.update');
});
