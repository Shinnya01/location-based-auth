<?php

namespace Sitebound\LocationAuth\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Laravel\Fortify\LoginRateLimiter;
use Sitebound\LocationAuth\Actions\EnsureRequestIsWithinAllowedLocation;
use Sitebound\LocationAuth\Exceptions\LocationAccessDeniedException;
use Symfony\Component\HttpFoundation\Response;

class EnsureLocationAuthForFortifyRequests
{
    /**
     * Create a new middleware instance.
     */
    public function __construct(
        private readonly EnsureRequestIsWithinAllowedLocation $locationAccess,
        private readonly LoginRateLimiter $limiter,
    ) {}

    /**
     * Handle the incoming request.
     *
     * @throws LocationAccessDeniedException
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $this->shouldValidate($request)) {
            return $next($request);
        }

        try {
            $this->locationAccess->handle($request);
        } catch (LocationAccessDeniedException $exception) {
            if ($request->routeIs('login.store')) {
                $this->limiter->increment($request);
            }

            throw $exception;
        }

        return $next($request);
    }

    /**
     * Determine if the current request should be checked.
     */
    private function shouldValidate(Request $request): bool
    {
        if ($request->method() !== Request::METHOD_POST) {
            return false;
        }

        return $request->routeIs(...config('location-auth.fortify.route_names', [
            'login.store',
            'register.store',
        ]));
    }
}
