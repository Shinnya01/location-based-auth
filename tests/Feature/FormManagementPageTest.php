<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class FormManagementPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page(): void
    {
        $response = $this->get(route('record-keeping.forms'));

        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_users_can_visit_the_form_management_page(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->get(route('record-keeping.forms'));

        $response
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('FormManagement'),
            );
    }
}
