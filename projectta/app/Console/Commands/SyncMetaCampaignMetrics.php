<?php

namespace App\Console\Commands;

use App\Models\Campaign;
use App\Services\MetaCampaignMetricsService;
use Illuminate\Console\Command;
use Throwable;

class SyncMetaCampaignMetrics extends Command
{
    protected $signature = 'campaigns:sync-meta-metrics {campaign? : Campaign ID yang ingin disinkronkan}';

    protected $description = 'Sync Instagram metrics into campaigns.';

    public function handle(MetaCampaignMetricsService $service): int
    {
        $campaignId = $this->argument('campaign');

        if ($campaignId) {
            $campaign = Campaign::find($campaignId);

            if (! $campaign) {
                $this->error("Campaign {$campaignId} tidak ditemukan.");

                return self::FAILURE;
            }

            return $this->syncCampaign($service, $campaign) ? self::SUCCESS : self::FAILURE;
        }

        $count = 0;
        $failed = 0;

        Campaign::query()
            ->where(function ($query) {
                $query->whereNotNull('instagram_media_id')
                    ->orWhereNotNull('instagram_permalink');
            })
            ->orderBy('id')
            ->chunkById(100, function ($campaigns) use ($service, &$count, &$failed) {
                foreach ($campaigns as $campaign) {
                    if ($this->syncCampaign($service, $campaign)) {
                        $count++;
                    } else {
                        $failed++;
                    }
                }
            });

        $this->info("Selesai sinkron {$count} campaign. Gagal: {$failed}.");

        return $failed === 0 ? self::SUCCESS : self::FAILURE;
    }

    private function syncCampaign(MetaCampaignMetricsService $service, Campaign $campaign): bool
    {
        try {
            $campaign = $service->sync($campaign);

            $this->info(sprintf(
                'Campaign #%d synced: views=%d, likes=%d, comments=%d',
                $campaign->id,
                $campaign->views,
                $campaign->likes,
                $campaign->comments
            ));

            return true;
        } catch (Throwable $exception) {
            $this->error("Campaign #{$campaign->id} gagal sync: {$exception->getMessage()}");

            return false;
        }
    }
}
