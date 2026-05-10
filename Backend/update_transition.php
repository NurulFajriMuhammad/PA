<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

\DB::table('pengajuan_transitions')->where('id', 28)->update(['role_id' => 3]);
echo "Updated transition ID 28 to role_id=3\n";
