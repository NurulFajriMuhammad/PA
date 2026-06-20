<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$transitions = \DB::table('pengajuan_transitions')->where('jenis', 'internal')->get();
echo "Internal Transitions:\n";
foreach ($transitions as $t) {
    echo "ID: {$t->id} | Current: {$t->status_pemeriksaan_id} | Next: {$t->status_selanjutnya_id} | Back: {$t->status_dikembalikan_id} | Role: {$t->role_id}\n";
}
