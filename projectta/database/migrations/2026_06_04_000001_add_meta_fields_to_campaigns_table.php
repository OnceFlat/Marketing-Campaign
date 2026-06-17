<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('campaigns', function (Blueprint $table) {
            $table->string('instagram_media_id')->nullable()->index();
            $table->string('instagram_permalink')->nullable();
            $table->unsignedInteger('instagram_reach')->default(0);
            $table->timestamp('instagram_last_sync_at')->nullable();
            $table->string('meta_ad_account_id')->nullable();
            $table->string('meta_campaign_id')->nullable()->index();
            $table->decimal('ad_spend', 14, 2)->default(0);
        });
    }

    public function down(): void
    {
        Schema::table('campaigns', function (Blueprint $table) {
            $table->dropColumn([
                'instagram_media_id',
                'instagram_permalink',
                'instagram_reach',
                'instagram_last_sync_at',
                'meta_ad_account_id',
                'meta_campaign_id',
                'ad_spend',
            ]);
        });
    }
};
