<?php

namespace App\Services;

use Illuminate\Support\Facades\Route;
use App\Models\ApiRoute;
use Illuminate\Database\QueryException;

class DynamicApiRouteLoader
{
    public static function load()
    {
        try {
            $routes = ApiRoute::where('is_active', true)->get();
            foreach ($routes as $r) {
                $controllerClass = "App\\Http\\Controllers\\Api\\" . $r->controller;
                if (!class_exists($controllerClass)) {
                    continue; 
                }

                $middleware = ['api'];
                if ($r->permission) {
                    $middleware[] = "permission:$r->permission";
                }

                // ensure path does not accidentally begin with a slash (we always prefix with api below)
                $routePath = ltrim($r->path, '/');

                // register under the api prefix; this mirrors Laravel's default api.php behaviour
                Route::prefix('api')
                    ->middleware($middleware)
                    ->match([$r->method], $routePath, [$controllerClass, $r->action]);
            }
        } catch (QueryException $e) {
            // Database or table doesn't exist yet, skip dynamic routes
            // This allows the app to boot during initial setup
        } catch (\Exception $e) {
            // Other exceptions should also be caught silently during boot
            // This prevents the app from crashing during migrations
        }
    }
}
