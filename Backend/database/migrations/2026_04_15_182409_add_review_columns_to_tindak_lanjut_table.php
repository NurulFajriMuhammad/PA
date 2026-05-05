<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tindak_lanjut', function (Blueprint $table) {
            if (!Schema::hasColumn('tindak_lanjut', 'hasil_evaluasi')) {
                $table->string('hasil_evaluasi')->nullable()->after('bulan');
            }
            if (!Schema::hasColumn('tindak_lanjut', 'kesimpulan')) {
                $table->text('kesimpulan')->nullable()->after('hasil_evaluasi');
            }
        });
    }

    public function down(): void
    {
        Schema::table('tindak_lanjut', function (Blueprint $table) {
            $table->dropColumnIfExists('hasil_evaluasi');
            $table->dropColumnIfExists('kesimpulan');
        });
    }
};
