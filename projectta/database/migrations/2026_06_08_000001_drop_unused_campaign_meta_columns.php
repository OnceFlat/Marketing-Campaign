<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('campaigns', function (Blueprint $table) {
            $table->dropColumn([
                'instagram_reach',
                'instagram_last_sync_at',
                'meta_ad_account_id',
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('campaigns', function (Blueprint $table) {
            $table->unsignedInteger('instagram_reach')->default(0);
            $table->timestamp('instagram_last_sync_at')->nullable();
            $table->string('meta_ad_account_id')->nullable();
        });
    }
};
