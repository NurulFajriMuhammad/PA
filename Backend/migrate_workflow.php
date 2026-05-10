<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== STEP 1: Update Status Audit ===\n";
\DB::table('status_pemeriksaans')->where('id', 7)->update(['nama' => 'Monitoring Tindak Lanjut']);
echo "ID 7 renamed to 'Monitoring Tindak Lanjut'\n";

// Cek apakah ID 8 masih digunakan
$usedId8 = \DB::table('external_audits')->where('id_status_pemeriks', 8)->count();
echo "Audit yang pakai status ID 8: $usedId8\n";
if ($usedId8 == 0) {
    \DB::table('status_pemeriksaans')->where('id', 8)->delete();
    echo "ID 8 (Review RTL) dihapus\n";
} else {
    echo "ID 8 tidak dihapus karena masih digunakan\n";
}

echo "\n=== STEP 2: Bersihkan pengajuan_transitions ===\n";
// Hapus transisi yang tidak diperlukan
$deleted = \DB::table('pengajuan_transitions')->whereIn('id', [26, 30, 31, 32])->delete();
echo "Hapus transisi ID 26,30,31,32: $deleted baris dihapus\n";

// Set status_dikembalikan_id = NULL untuk transisi 27, 28, 29
\DB::table('pengajuan_transitions')->whereIn('id', [27, 28, 29])->update(['status_dikembalikan_id' => null]);
echo "Set status_dikembalikan_id = NULL untuk ID 27,28,29\n";

echo "\n=== STEP 3: Update Status Temuan ===\n";
$updated = \DB::table('external_audit_temuan')
    ->where('status', 'Pengisian RTL')
    ->update(['status' => 'Dalam Perbaikan']);
echo "Update '$updated' temuan dari 'Pengisian RTL' -> 'Dalam Perbaikan'\n";

echo "\n=== DONE ===\n";
echo "Verifikasi transitions yang tersisa:\n";
$transitions = \DB::table('pengajuan_transitions')->where('jenis', 'eksternal')->get();
$statuses = \DB::table('status_pemeriksaans')->get()->keyBy('id');
$roles = \DB::table('roles')->get()->keyBy('id');
foreach ($transitions as $t) {
    $from = $statuses[$t->status_pemeriksaan_id]->nama ?? '?';
    $to = $statuses[$t->status_selanjutnya_id]->nama ?? '-';
    $back = $t->status_dikembalikan_id ? ($statuses[$t->status_dikembalikan_id]->nama ?? '-') : 'NULL';
    $role = $roles[$t->role_id]->name ?? '?';
    echo "ID:{$t->id} | {$from} → {$to} | Kembali: {$back} | Role: {$role}\n";
}
