<?php

namespace Sitebound\LocationAuth\Fortify;

use Illuminate\Http\Request;
use Laravel\Fortify\LoginRateLimiter;
use Sitebound\LocationAuth\Actions\EnsureRequestIsWithinAllowedLocation;
use Sitebound\LocationAuth\Exceptions\LocationAccessDeniedException;

class EnsureLoginIsWithinAllowedLocation
{
    /**
     * Create a new action instance.
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
    public function handle(Request $request, callable $next): mixed
    {
        try {
            $this->locationAccess->handle($request);
        } catch (LocationAccessDeniedException $exception) {
            $this->limiter->increment($request);

            throw $exception;
        }

        return $next($request);
    }
}
