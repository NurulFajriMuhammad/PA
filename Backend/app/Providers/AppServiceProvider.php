<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\ServiceProvider;
use Illuminate\Routing\Router;
use Illuminate\Support\Facades\Broadcast;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Broadcast::routes(['middleware' => ['auth:sanctum']]);
        require base_path('routes/channels.php');

        ResetPassword::createUrlUsing(function (object $notifiable, string $token) {
            return config('app.frontend_url')."/password-reset/$token?email={$notifiable->getEmailForPasswordReset()}";
        });

        try {
            /** @var Router $router */
            $router = $this->app->make(Router::class);
            $router->aliasMiddleware('permission', \App\Http\Middleware\TogglePermissionMiddleware::class);
            $router->aliasMiddleware('role', \App\Http\Middleware\ToggleRoleMiddleware::class);
            $router->aliasMiddleware('role_or_permission', \App\Http\Middleware\ToggleRoleOrPermissionMiddleware::class);
        } catch (\Throwable $e) {
            // ignore if router tidak tersedia pada fase ini
        }
    }
}
