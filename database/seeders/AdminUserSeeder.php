<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::query()->updateOrCreate(
            ['email' => config('admin-user.email')],
            [
                'name' => config('admin-user.name'),
                'password' => Hash::make(config('admin-user.password')),
                'is_admin' => true,
                'email_verified_at' => now(),
            ],
        );
    }
}
