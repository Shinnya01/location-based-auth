<?php

namespace Sitebound\LocationAuth\Exceptions;

use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class LocationAccessDeniedException extends Exception
{
    /**
     * Render the exception as an HTTP response.
     */
    public function render(Request $request): RedirectResponse|Response
    {
        $routeName = config('location-auth.denied_route_name');

        if (
            is_string($routeName)
            && $routeName !== ''
            && app('router')->has($routeName)
            && $request->route()?->getName() !== $routeName
        ) {
            return redirect()->guest(route($routeName));
        }

        return response('Location access denied.', 403);
    }
}
