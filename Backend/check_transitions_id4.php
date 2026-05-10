<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$transitions = \DB::table('pengajuan_transitions')->where('status_pemeriksaan_id', 4)->get();
echo "Transitions for Konfirmasi Auditee (ID 4):\n";
print_r($transitions->toArray());
