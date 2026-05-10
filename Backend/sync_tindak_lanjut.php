<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$id = 4; // ID from screenshot
$temuanList = \DB::table('external_audit_temuan')
    ->where('external_audit_id', $id)
    ->get();

foreach ($temuanList as $t) {
    $exists = \DB::table('tindak_lanjut')
        ->where('temuan_id', $t->id)
        ->where('jenis_audit', 'eksternal')
        ->exists();

    if (!$exists) {
        \DB::table('tindak_lanjut')->insert([
            'temuan_id' => $t->id,
            'unit' => $t->unit ?? '-',
            'masalah' => $t->masalah,
            'rekomendasi' => $t->rekomendasi,
            'target_selesai' => $t->target_penyelesaian,
            'jenis_audit' => 'eksternal',
            'status' => 'draft',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        echo "Inserted temuan ID: " . $t->id . "\n";
    } else {
        echo "Temuan ID: " . $t->id . " already exists\n";
    }
}
echo "Done sync.\n";
