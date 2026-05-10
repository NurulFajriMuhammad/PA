<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$transitions = \DB::table('pengajuan_transitions')
    ->where('jenis', 'eksternal')
    ->orderBy('status_pemeriksaan_id')
    ->get();

$roles = \DB::table('roles')->get()->keyBy('id');
$statuses = \DB::table('status_pemeriksaans')->get()->keyBy('id');

echo "=== EKSTERNAL AUDIT TRANSITIONS ===\n\n";
foreach ($transitions as $t) {
    $role = $roles[$t->role_id] ?? null;
    $from = $statuses[$t->status_pemeriksaan_id] ?? null;
    $to = $statuses[$t->status_selanjutnya_id] ?? null;
    $back = $statuses[$t->status_dikembalikan_id] ?? null;
    echo "ID:{$t->id} | Dari: " . ($from ? $from->nama : '?') . " | Role: " . ($role ? $role->name : '?') . "\n";
    echo "  -> Maju ke: " . ($to ? $to->nama : '-') . "\n";
    echo "  -> Kembali ke: " . ($back ? $back->nama : '-') . "\n\n";
}
