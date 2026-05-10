<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Menggunakan raw SQL karena PostgreSQL cukup ketat soal perubahan tipe data Primary Key
        DB::statement('ALTER TABLE kka ALTER COLUMN id TYPE VARCHAR(255)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('ALTER TABLE kka ALTER COLUMN id TYPE BIGINT USING (id::bigint)');
    }
};
