<?php

namespace Sitebound\LocationAuth;

use Illuminate\Support\ServiceProvider;

class LocationAuthServiceProvider extends ServiceProvider
{
    /**
     * Register any package services.
     */
    public function register(): void
    {
        $this->mergeConfigFrom(__DIR__.'/../config/location-auth.php', 'location-auth');
    }

    /**
     * Bootstrap any package services.
     */
    public function boot(): void
    {
        $this->publishes([
            __DIR__.'/../config/location-auth.php' => config_path('location-auth.php'),
        ], 'location-auth-config');

        $this->publishesMigrations([
            __DIR__.'/../database/migrations/create_location_login_settings_table.php' => database_path('migrations/create_location_login_settings_table.php'),
        ], 'location-auth-migrations');
    }
}
