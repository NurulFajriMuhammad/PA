<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$statuses = \DB::table('status_pemeriksaans')->get();
echo "Statuses:\n";
foreach ($statuses as $s) {
    echo "ID: " . $s->id . " Name: " . $s->nama . "\n";
}
