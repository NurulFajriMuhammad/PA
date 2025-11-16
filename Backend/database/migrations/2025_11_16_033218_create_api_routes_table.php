<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('api_routes', function (Blueprint $table) {
            $table->id();
            $table->enum('method', ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'])->index();
            $table->string('path')->unique();
            $table->string('controller');
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('api_routes');
    }
};