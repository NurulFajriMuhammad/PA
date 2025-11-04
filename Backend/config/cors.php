<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    // 'paths' => ['*'],
    // 'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'logout'],
    // 'paths' => [
    //     'api/*',
    //     'login',
    //     'logout',
    //     'register',
    //     'sanctum/csrf-cookie'
    // ],

    'allowed_methods' => ['*'],

    // 'allowed_origins' => explode(',', env('CORS_ALLOWED_ORIGINS', '*')),
    'allowed_origins' => ['http://localhost:5173', 'http://192.168.0.24:5173'],
    
    // 'allowed_origins' => ['http://192.168.0.33:5176', 'http://192.168.1.9:5173',],
    // 'allowed_origins' => ['http://192.168.0.27:5174'],
    // 'allowed_origins' => ['http://localhost:5173', 'http://192.168.1.5:5173', 'http://192.168.0.27:5174',],
    // 'allowed_origins' => [
    //     'http://pa.test',
    //     'http://localhost:5174',
    //     'http://192.168.0.27:5174',
    // ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 3600,

    'supports_credentials' => true,


];
