<?php

namespace Sitebound\LocationAuth\Commands;

use Illuminate\Console\Command;
use Sitebound\LocationAuth\LocationAuthServiceProvider;

class InstallCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'location-auth:install
        {--stack=inertia-vue : Publish the matching frontend preset (inertia-vue or none)}
        {--force : Overwrite existing published files}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Install the Laravel Location Auth package assets';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $stack = (string) $this->option('stack');

        if (! in_array($stack, ['inertia-vue', 'none'], true)) {
            $this->components->error("Unsupported stack [{$stack}]. Use inertia-vue or none.");

            return self::INVALID;
        }

        $publishOptions = [
            '--provider' => LocationAuthServiceProvider::class,
            '--force' => (bool) $this->option('force'),
        ];

        $this->call('vendor:publish', [
            ...$publishOptions,
            '--tag' => 'location-auth-config',
        ]);

        $this->call('vendor:publish', [
            ...$publishOptions,
            '--tag' => 'location-auth-migrations',
        ]);

        if ($stack === 'inertia-vue') {
            $this->call('vendor:publish', [
                ...$publishOptions,
                '--tag' => 'location-auth-inertia-vue',
            ]);
        }

        $this->components->info('Laravel Location Auth installed.');
        $this->newLine();
        $this->line('Next steps:');
        $this->line("  1. Define Gate::define('manage-location-auth', fn (User \$user) => \$user->is_admin);");
        $this->line('  2. Run php artisan migrate.');
        $this->line('  3. Review the published auth and settings pages before shipping.');

        if ($stack === 'inertia-vue') {
            $this->line('  4. Run npm install and npm run build (or npm run dev) for the published frontend files.');
        }

        return self::SUCCESS;
    }
}
