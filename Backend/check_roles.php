<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$roles = \DB::table('roles')->get();
echo "Roles:\n";
foreach ($roles as $r) {
    echo "ID: " . $r->id . " Name: " . $r->name . "\n";
}
