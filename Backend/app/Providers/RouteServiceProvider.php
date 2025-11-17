<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\DynamicApiRouteLoader;

class RouteServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        DynamicApiRouteLoader::load();
    }
}
