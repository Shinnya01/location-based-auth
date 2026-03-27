<?php

use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SecurityController;
use App\Http\Controllers\Settings\LocationAccessController;
use App\Http\Middleware\EnsureUserIsAdmin;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/security', [SecurityController::class, 'edit'])->name('security.edit');

    Route::put('settings/password', [SecurityController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::get('settings/location-access', [LocationAccessController::class, 'edit'])
        ->middleware(EnsureUserIsAdmin::class)
        ->name('location-access.edit');
    Route::put('settings/location-access', [LocationAccessController::class, 'update'])
        ->middleware(EnsureUserIsAdmin::class)
        ->name('location-access.update');

    Route::inertia('settings/appearance', 'settings/Appearance')->name('appearance.edit');
});
