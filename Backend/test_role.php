<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->bootstrap();

$request = new Illuminate\Http\Request();
$request->setMethod('PUT');
$request->merge(['name' => 'Test Role', 'permission_ids' => [1,2,999]]);
$role = \Spatie\Permission\Models\Role::find(4);
$controller = new \App\Http\Controllers\Api\RoleController();

try {
    $response = $controller->update($request, $role);
    echo 'Success: ' . $response->getContent();
} catch (Exception $e) {
    echo 'Error: ' . $e->getMessage();
}