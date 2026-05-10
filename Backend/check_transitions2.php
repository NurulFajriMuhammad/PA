<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$role = \DB::table('roles')->where('name', 'auditee')->first();
$status = \DB::table('status_pemeriksaans')->where('nama', 'Konfirmasi Auditee')->first();
echo "Role ID: " . ($role ? $role->id : 'null') . "\n";
echo "Status ID: " . ($status ? $status->id : 'null') . "\n";
$transitions = \DB::table('pengajuan_transitions')->where('role_id', $role ? $role->id : 0)->get();
echo "Transitions for Auditee:\n";
print_r($transitions->toArray());
