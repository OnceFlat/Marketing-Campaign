<?php

namespace App\Console\Commands;

use App\Models\Campaign;
use App\Services\MetaCampaignMetricsService;
use Illuminate\Console\Command;
use Throwable;

class ResolveInstagramCampaignMedia extends Command
{
    protected $signature = 'campaigns:resolve-instagram-media {campaign? : Campaign ID yang ingin dicari media ID-nya}';

    protected $description = 'Resolve Instagram media IDs from campaign Instagram permalinks.';

    public function handle(MetaCampaignMetricsService $service): int
    {
        $campaignId = $this->argument('campaign');

        if ($campaignId) {
            $campaign = Campaign::find($campaignId);

            if (! $campaign) {
                $this->error("Campaign {$campaignId} tidak ditemukan.");

                return self::FAILURE;
            }

            return $this->resolveCampaign($service, $campaign) ? self::SUCCESS : self::FAILURE;
        }

        $resolved = 0;
        $failed = 0;

        Campaign::query()
            ->whereNotNull('instagram_permalink')
            ->whereNull('instagram_media_id')
            ->orderBy('id')
            ->chunkById(100, function ($campaigns) use ($service, &$resolved, &$failed) {
                foreach ($campaigns as $campaign) {
                    if ($this->resolveCampaign($service, $campaign)) {
                        $resolved++;
                    } else {
                        $failed++;
                    }
                }
            });

        $this->info("Selesai resolve {$resolved} campaign. Gagal: {$failed}.");

        return $failed === 0 ? self::SUCCESS : self::FAILURE;
    }

    private function resolveCampaign(MetaCampaignMetricsService $service, Campaign $campaign): bool
    {
        try {
            $campaign = $service->resolve($campaign);

            $this->info(sprintf(
                'Campaign #%d resolved: instagram_media_id=%s',
                $campaign->id,
                $campaign->instagram_media_id
            ));

            return true;
        } catch (Throwable $exception) {
            $this->error("Campaign #{$campaign->id} gagal resolve: {$exception->getMessage()}");

            return false;
        }
    }
}
