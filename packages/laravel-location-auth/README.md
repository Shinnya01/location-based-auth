# Laravel Location Auth

Location-based authentication for Laravel apps using Fortify and Inertia Vue.

This package adds:

- location-aware login and registration checks
- a settings screen for the saved geofence
- an access denied screen
- an install command to publish config, migrations, and Inertia Vue starter files

## Requirements

- PHP 8.3+
- Laravel 13
- Laravel Fortify
- Inertia Laravel v3
- Vue 3 if you use the `inertia-vue` preset

## Installation

### 1. Require the package

```bash
composer require sitebound/laravel-location-auth
```

### 2. Install the package files

For a Laravel + Inertia + Vue app:

```bash
php artisan location-auth:install --stack=inertia-vue
```

If you only want the backend pieces:

```bash
php artisan location-auth:install --stack=none
```

### 3. Run migrations

```bash
php artisan migrate
```

### 4. Define who can manage the location settings

Add a gate in your `AppServiceProvider` or another service provider:

```php
use App\Models\User;
use Illuminate\Support\Facades\Gate;

Gate::define('manage-location-auth', fn (User $user) => (bool) $user->is_admin);
```

If you do not use `is_admin`, change the gate to match your app's own authorization rules.

### 5. Build frontend assets

If you installed the `inertia-vue` preset:

```bash
npm install
npm run build
```

During development, you can use:

```bash
npm run dev
```

## Published Files

The install command publishes:

- `config/location-auth.php`
- the `location_login_settings` migration
- `resources/js/composables/useAuthLocationAccess.ts`
- `resources/js/lib/locationAccess.ts`
- `resources/js/pages/auth/Login.vue`
- `resources/js/pages/auth/Register.vue`
- `resources/js/pages/auth/LocationAccessDenied.vue`
- `resources/js/pages/settings/LocationAccess.vue`

These frontend files are meant to be edited in the host app after publishing.

## Typical Flow

```bash
laravel new my-app --vue
cd my-app

composer require sitebound/laravel-location-auth
php artisan location-auth:install --stack=inertia-vue
php artisan migrate
npm install
npm run build
```

Then define the `manage-location-auth` gate and customize the published Vue pages as needed.

## Configuration

The package config lives in `config/location-auth.php`.

Useful options include:

- `default_radius_meters`
- `max_radius_meters`
- `max_age_seconds`
- `fortify.register_views`
- `routes.settings_gate`

## Notes

- This package is designed for apps that already use Fortify.
- The default frontend preset targets Inertia + Vue.
- The package does not force a specific admin model field; authorization is controlled through the gate.
