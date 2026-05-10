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
        Schema::table('tindak_lanjut', function (Blueprint $table) {
            $table->integer('persentase')->default(0);
            $table->string('estimasi_selesai')->nullable();
            $table->string('pic_pelaksana')->nullable();
            $table->text('kendala')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tindak_lanjut', function (Blueprint $table) {
            $table->dropColumn(['persentase', 'estimasi_selesai', 'pic_pelaksana', 'kendala']);
        });
    }
};
