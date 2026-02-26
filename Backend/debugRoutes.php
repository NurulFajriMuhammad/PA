<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\Route;

foreach (Route::getRoutes() as $route) {
    $action = $route->getAction();
    $uses = $action['uses'] ?? '(none)';
    if ($uses instanceof \Closure) {
        $uses = 'Closure';
    }
    $controllerClass = null;
    try {
        $controllerClass = $route->getControllerClass();
    } catch (Exception $e) {
        $controllerClass = 'EXCEPTION: ' . $e->getMessage();
    }
    $actionName = method_exists($route, 'getActionName') ? $route->getActionName() : '(noactionname)';
    echo "URI: {$route->uri()} | uses: {$uses} | controllerClass: {$controllerClass} | actionName: {$actionName}\n";
}

