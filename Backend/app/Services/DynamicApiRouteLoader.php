<?php

namespace App\Services;

use Illuminate\Support\Facades\Route;
use App\Models\ApiRoute;

class DynamicApiRouteLoader
{
    public static function load()
    {
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

            Route::middleware($middleware)
                ->match([$r->method], $r->path, [$controllerClass, $r->action]);
        }
    }
}
