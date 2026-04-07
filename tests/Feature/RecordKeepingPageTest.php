<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class RecordKeepingPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page(): void
    {
        $response = $this->get(route('record-keeping'));

        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_users_can_visit_the_record_keeping_page(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->get(route('record-keeping'));

        $response
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('RecordKeeping'),
            );
    }
}
