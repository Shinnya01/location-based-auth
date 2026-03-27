<?php

namespace App\Actions\Fortify;

use App\Actions\LocationAccess\EnsureRequestIsWithinAllowedLocation;
use App\Exceptions\LocationAccessDeniedException;
use Illuminate\Http\Request;
use Laravel\Fortify\LoginRateLimiter;

class EnsureLoginIsWithinAllowedLocation
{
    /**
     * Create a new action instance.
     */
    public function __construct(
        private readonly EnsureRequestIsWithinAllowedLocation $locationAccess,
        private readonly LoginRateLimiter $limiter,
    ) {
    }

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
