<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Jabatan;
use App\Models\Unit;

$mappings = [
    'Chief Executive Officer' => ['Kantor Pusat', 'Corporate Secretary'],
    'Head of Compliance' => ['Compliance & Internal Auditor', 'Legal Compliance'],
    'Legal Counsel Manager' => ['Legal'],
    'Business Development Manager' => ['Business Development'],
    'HR Business Partner Manager' => ['Human Resources Development'],
    // New Jabatans
    'IT Manager' => ['Information Technology', 'IT Support'],
    'Finance Manager' => ['Finance & Accounting', 'Tax'],
    'Marketing Director' => ['Marketing', 'Sales'],
    'Operations Manager' => ['Production', 'Quality Control'],
    'Warehouse Supervisor' => ['Warehouse', 'Procurement'],
    'Customer Service Lead' => ['Customer Service', 'Customer Relationship Management']
];

foreach ($mappings as $jabatanName => $unitNames) {
    $jabatan = Jabatan::firstOrCreate(['nama' => $jabatanName]);
    
    $unitIds = Unit::whereIn('nama', $unitNames)->pluck('id')->toArray();
    
    // Sync will attach these IDs and remove any other existing ones for this jabatan.
    // If we only want to attach without detaching others, we'd use syncWithoutDetaching,
    // but since we want to fix "unclear units", replacing them is correct.
    $jabatan->units()->sync($unitIds);
}

echo "Data Jabatan beserta pemetaan unitnya berhasil diperbarui dan ditambahkan!\n";
