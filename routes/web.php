<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'Welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::inertia('location-access-denied', 'auth/LocationAccessDenied')->name('location-access-denied');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'Dashboard')->name('dashboard');
    Route::inertia('record-keeping', 'RecordKeeping')->name('record-keeping');
    Route::inertia('record-keeping/forms', 'FormManagement')->name('record-keeping.forms');
    Route::inertia('timekeeping', 'Timekeeping')->name('timekeeping');
});

require __DIR__.'/settings.php';
