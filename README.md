# Sitebound Access

Sitebound Access is a Laravel + Inertia + Vue application that adds location-based access control to authentication.

Admins can define one approved map point and radius in meters. Login and registration are only allowed when the browser can verify that the user is inside that geofence.

## Features

- Location-restricted login
- Location-restricted registration
- Admin-managed geofence settings
- Leaflet + OpenStreetMap geofence editor
- Browser geolocation support with live radius preview
- Fortify authentication with optional two-factor challenge support
- Dedicated access denied page for failed location checks

## Stack

- Laravel 13
- PHP 8.3+
- Inertia.js v3
- Vue 3
- Tailwind CSS v4
- Laravel Fortify
- Laravel Wayfinder
- Leaflet
- Laravel Sail

## How It Works

1. An admin signs in and opens `/settings/location-access`.
2. The admin sets a center point and radius in meters.
3. The admin enables location-based access.
4. During login or registration, the browser asks for the user's current location.
5. The backend checks:
    - latitude and longitude are present
    - the reading is fresh
    - the user is inside the saved radius
6. If the check fails, the user is redirected to `/location-access-denied`.

## Local Development

### 1. Install dependencies

```bash
composer install
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
php artisan key:generate
```

### 3. Start Sail

```bash
./vendor/bin/sail up -d
```

### 4. Run migrations and seeders

```bash
./vendor/bin/sail artisan migrate --seed
```

This seeds the default admin account through `DatabaseSeeder`.

### 5. Start the frontend dev server

```bash
./vendor/bin/sail npm install
./vendor/bin/sail npm run dev
```

### 6. Open the app

By default, the app is available through your Sail environment. If you need the exact URL, run:

```bash
./vendor/bin/sail artisan about
```

## Default Admin Account

The seeded admin account comes from [`config/admin-user.php`](config/admin-user.php):

- Email: `admin@example.com`
- Password: `password`

You can change those defaults before seeding if you want a different initial admin user.

## Admin Geofence Setup

After signing in as an admin:

1. Open `/settings/location-access`
2. Set the center point using:
    - latitude/longitude inputs
    - `Use my location`
    - the map editor dialog
3. Set the radius in meters
4. Enable `Require location for access`
5. Save the settings

The map editor uses Leaflet with OpenStreetMap and shows the live geofence circle.

## Configuration

Location access defaults live in [`config/location-auth.php`](config/location-auth.php):

- `default_radius_meters`: default radius for new settings
- `max_radius_meters`: maximum allowed radius
- `max_age_seconds`: maximum age for a submitted location reading

## Browser Notes

- Browser geolocation permission is required when location access is enabled.
- `localhost` is usually enough for development geolocation prompts.
- Accuracy depends on the device and environment.
- If the browser cannot verify the current location, login and registration are blocked.

## Useful Commands

### Run tests

```bash
./vendor/bin/sail artisan test --compact
```

### Run a specific test file

```bash
./vendor/bin/sail artisan test --compact tests/Feature/Auth/AuthenticationTest.php
```

### Type-check the frontend

```bash
./vendor/bin/sail npm exec vue-tsc -- --noEmit
```

### Format PHP

```bash
./vendor/bin/sail php vendor/bin/pint --dirty --format agent
```

### Regenerate Wayfinder routes/actions

```bash
./vendor/bin/sail artisan wayfinder:generate --with-form --no-interaction
```

## Main Routes

- `/` - welcome page
- `/login` - login
- `/register` - registration
- `/location-access-denied` - access denied page
- `/dashboard` - authenticated dashboard
- `/settings/location-access` - admin geofence settings

## Project Status

This project already includes:

- admin seeding
- geofence settings UI
- location-aware login and registration
- access denied redirect flow
- feature coverage for authentication and settings behavior

## License

This project is open-sourced under the [MIT license](https://opensource.org/licenses/MIT).
