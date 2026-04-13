<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DepartmentPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page(): void
    {
        $response = $this->get(route('departments'));

        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_users_can_visit_the_department_page(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->get(route('departments'));

        $response
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Department'),
            );
    }
}
