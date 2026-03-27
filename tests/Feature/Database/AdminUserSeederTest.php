<?php

namespace Tests\Feature\Database;

use App\Models\User;
use Database\Seeders\AdminUserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminUserSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_user_seeder_creates_the_configured_admin_user(): void
    {
        config([
            'admin-user.name' => 'System Admin',
            'admin-user.email' => 'admin@location-auth.test',
            'admin-user.password' => 'secret-password',
        ]);

        $this->seed(AdminUserSeeder::class);

        $admin = User::query()
            ->where('email', 'admin@location-auth.test')
            ->sole();

        $this->assertSame('System Admin', $admin->name);
        $this->assertTrue($admin->is_admin);
        $this->assertNotNull($admin->email_verified_at);
        $this->assertTrue(Hash::check('secret-password', $admin->password));
    }

    public function test_admin_user_seeder_is_idempotent(): void
    {
        config([
            'admin-user.email' => 'admin@location-auth.test',
        ]);

        $this->seed(AdminUserSeeder::class);
        $this->seed(AdminUserSeeder::class);

        $this->assertSame(1, User::query()->where('email', 'admin@location-auth.test')->count());
    }

    public function test_database_seeder_includes_the_admin_user(): void
    {
        config([
            'admin-user.email' => 'admin@location-auth.test',
        ]);

        $this->seed();

        $this->assertSame(1, User::query()->where('email', 'admin@location-auth.test')->count());
        $this->assertTrue(User::query()->where('email', 'admin@location-auth.test')->sole()->is_admin);
    }
}
