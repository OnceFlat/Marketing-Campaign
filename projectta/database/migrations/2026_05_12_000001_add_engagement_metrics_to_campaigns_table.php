<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('campaigns', function (Blueprint $table) {
            $table->unsignedInteger('views')->default(0)->after('budget');
            $table->unsignedInteger('likes')->default(0)->after('views');
            $table->unsignedInteger('comments')->default(0)->after('likes');
            $table->unsignedInteger('shares')->default(0)->after('comments');
        });
    }

    public function down(): void
    {
        Schema::table('campaigns', function (Blueprint $table) {
            $table->dropColumn(['views', 'likes', 'comments', 'shares']);
        });
    }
};
