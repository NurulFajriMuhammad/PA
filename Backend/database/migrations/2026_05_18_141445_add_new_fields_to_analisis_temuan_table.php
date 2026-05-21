<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('analisis_temuan', function (Blueprint $table) {
            $table->text('analisa_auditor')->nullable()->after('analisa');
            $table->string('aspek_penolakan')->nullable()->after('feedback');
            $table->text('fakta_pembanding')->nullable()->after('aspek_penolakan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('analisis_temuan', function (Blueprint $table) {
            $table->dropColumn(['analisa_auditor', 'aspek_penolakan', 'fakta_pembanding']);
        });
    }
};
