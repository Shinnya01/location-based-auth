<?php

namespace Tests\Feature\Package;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Routing\Route;
use Laravel\Fortify\LoginRateLimiter;
use Sitebound\LocationAuth\Exceptions\LocationAccessDeniedException;
use Sitebound\LocationAuth\Http\Middleware\EnsureLocationAuthForFortifyRequests;
use Sitebound\LocationAuth\Models\LocationLoginSetting;
use Symfony\Component\HttpFoundation\Response;
use Tests\TestCase;

class EnsureLocationAuthForFortifyRequestsTest extends TestCase
{
    use RefreshDatabase;

    public function test_non_fortify_requests_are_passed_through_without_location_checks(): void
    {
        $middleware = app(EnsureLocationAuthForFortifyRequests::class);
        $request = $this->requestForRoute('dashboard');

        $handled = false;

        $response = $middleware->handle($request, function () use (&$handled): Response {
            $handled = true;

            return response('ok');
        });

        $this->assertTrue($handled);
        $this->assertSame(200, $response->getStatusCode());
    }

    public function test_login_requests_are_checked_when_the_route_name_matches(): void
    {
        $this->enableLocationAccess();
        $middleware = app(EnsureLocationAuthForFortifyRequests::class);
        $request = $this->requestForRoute('login.store', $this->locationPayload());

        $handled = false;

        $response = $middleware->handle($request, function () use (&$handled): Response {
            $handled = true;

            return response('ok');
        });

        $this->assertTrue($handled);
        $this->assertSame(200, $response->getStatusCode());
    }

    public function test_denied_login_requests_increment_the_login_rate_limiter(): void
    {
        $this->enableLocationAccess();

        $middleware = app(EnsureLocationAuthForFortifyRequests::class);
        $request = $this->requestForRoute('login.store', array_merge(
            [
                'email' => 'user@example.com',
                'password' => 'password',
            ],
            $this->locationPayload([
                'latitude' => 14.6035123,
            ]),
        ));

        $limiter = app(LoginRateLimiter::class);

        $this->assertSame(0, $limiter->attempts($request));

        try {
            $middleware->handle($request, fn (): Response => response('ok'));
            $this->fail('Expected a LocationAccessDeniedException to be thrown.');
        } catch (LocationAccessDeniedException) {
            $this->assertSame(1, $limiter->attempts($request));
        }
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function requestForRoute(string $routeName, array $payload = []): Request
    {
        $request = Request::create('/login', 'POST', $payload, server: [
            'REMOTE_ADDR' => '127.0.0.1',
        ]);

        $route = new Route(['POST'], '/login', static fn (): Response => response('ok'));
        $route->name($routeName);

        $request->setRouteResolver(static fn () => $route);

        return $request;
    }

    private function enableLocationAccess(): LocationLoginSetting
    {
        return LocationLoginSetting::query()->create([
            'is_enabled' => true,
            'latitude' => 14.5995123,
            'longitude' => 120.9842222,
            'radius_meters' => 200,
            'updated_by_user_id' => null,
        ]);
    }

    /**
     * @param  array<string, float|string>  $overrides
     * @return array<string, float|string>
     */
    private function locationPayload(array $overrides = []): array
    {
        return array_merge([
            'latitude' => 14.5995123,
            'longitude' => 120.9842222,
            'accuracy' => 15.0,
            'captured_at' => now()->toIso8601String(),
        ], $overrides);
    }
}
