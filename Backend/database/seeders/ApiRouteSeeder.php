<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ApiRoute;

class ApiRouteSeeder extends Seeder
{
    public function run()
    {
        ApiRoute::create([
            'method' => 'GET',
            'path' => 'users',
            'controller' => 'UserController',
            'action' => 'index',
            'permission' => 'view users',
            'is_active' => true,
        ]);

        ApiRoute::create([
            'method' => 'POST',
            'path' => 'users',
            'controller' => 'UserController',
            'action' => 'store',
            'permission' => 'create users',
            'is_active' => true,
        ]);
    }
}
