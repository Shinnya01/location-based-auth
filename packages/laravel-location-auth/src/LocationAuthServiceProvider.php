<?php

namespace Sitebound\LocationAuth;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;
use Laravel\Fortify\Fortify;
use Sitebound\LocationAuth\Commands\InstallCommand;
use Sitebound\LocationAuth\Http\Middleware\EnsureLocationAuthForFortifyRequests;
use Sitebound\LocationAuth\Support\LocationAccessViewData;

class LocationAuthServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->replaceConfigRecursivelyFrom(__DIR__.'/../config/location-auth.php', 'location-auth');
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->registerPublishes();
        $this->registerCommands();
        $this->registerFortifyViews();
        $this->registerFortifyMiddleware();
        $this->loadRoutesFrom(__DIR__.'/../routes/web.php');
    }

    /**
     * Register the package Fortify views.
     */
    private function registerFortifyViews(): void
    {
        if (! config('location-auth.fortify.register_views', true)) {
            return;
        }

        Fortify::loginView(function (Request $request) {
            return Inertia::render(
                (string) config('location-auth.frontend.components.login', 'auth/Login'),
                $this->app->make(LocationAccessViewData::class)->login($request),
            );
        });

        Fortify::registerView(function () {
            return Inertia::render(
                (string) config('location-auth.frontend.components.register', 'auth/Register'),
                $this->app->make(LocationAccessViewData::class)->register(),
            );
        });
    }

    /**
     * Register the Fortify middleware hook.
     */
    private function registerFortifyMiddleware(): void
    {
        Route::prependMiddlewareToGroup(
            (string) config('location-auth.fortify.middleware_group', 'web'),
            EnsureLocationAuthForFortifyRequests::class,
        );
    }

    /**
     * Register publishable assets.
     */
    private function registerPublishes(): void
    {
        if (! $this->app->runningInConsole()) {
            return;
        }

        $this->publishes([
            __DIR__.'/../config/location-auth.php' => config_path('location-auth.php'),
        ], 'location-auth-config');

        $this->publishesMigrations([
            __DIR__.'/../database/migrations' => database_path('migrations'),
        ], 'location-auth-migrations');

        $this->publishes($this->inertiaVueStubPaths(), 'location-auth-inertia-vue');
    }

    /**
     * Register package commands.
     */
    private function registerCommands(): void
    {
        if ($this->app->runningInConsole()) {
            $this->commands([
                InstallCommand::class,
            ]);
        }
    }

    /**
     * Get the publishable inertia-vue stub paths.
     *
     * @return array<string, string>
     */
    private function inertiaVueStubPaths(): array
    {
        return [
            __DIR__.'/../stubs/inertia-vue/resources/js/composables/useAuthLocationAccess.ts' => resource_path('js/composables/useAuthLocationAccess.ts'),
            __DIR__.'/../stubs/inertia-vue/resources/js/lib/locationAccess.ts' => resource_path('js/lib/locationAccess.ts'),
            __DIR__.'/../stubs/inertia-vue/resources/js/pages/auth/Login.vue' => resource_path('js/pages/auth/Login.vue'),
            __DIR__.'/../stubs/inertia-vue/resources/js/pages/auth/Register.vue' => resource_path('js/pages/auth/Register.vue'),
            __DIR__.'/../stubs/inertia-vue/resources/js/pages/auth/LocationAccessDenied.vue' => resource_path('js/pages/auth/LocationAccessDenied.vue'),
            __DIR__.'/../stubs/inertia-vue/resources/js/pages/settings/LocationAccess.vue' => resource_path('js/pages/settings/LocationAccess.vue'),
        ];
    }
}
