<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

\DB::table('external_audit_temuan')->where('external_audit_id', 4)->update(['status' => 'Pengisian RTL']);
echo "Updated findings status for audit 4 to Pengisian RTL\n";
