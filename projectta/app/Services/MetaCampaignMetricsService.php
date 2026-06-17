<?php

namespace App\Services;

use App\Models\Campaign;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class MetaCampaignMetricsService
{
    public function sync(Campaign $campaign): Campaign
    {
        $updates = [];

        if (! $campaign->instagram_media_id && $campaign->instagram_permalink) {
            $updates = array_merge($updates, $this->resolveInstagramMedia($campaign->instagram_permalink));
            $campaign->forceFill($updates);
        }

        if ($campaign->instagram_media_id) {
            $updates = array_merge($updates, $this->instagramMediaMetrics($campaign->instagram_media_id));
        }

        if ($updates !== []) {
            $campaign->forceFill($updates)->save();
        }

        return $campaign->refresh();
    }

    public function resolve(Campaign $campaign): Campaign
    {
        if (! $campaign->instagram_permalink) {
            throw new RuntimeException("Campaign {$campaign->id} does not have an Instagram permalink.");
        }

        $campaign->forceFill($this->resolveInstagramMedia($campaign->instagram_permalink))->save();

        return $campaign->refresh();
    }

    private function resolveInstagramMedia(string $permalink): array
    {
        $instagramBusinessId = config('services.meta.instagram_business_id');

        if (! $instagramBusinessId) {
            throw new RuntimeException('META_INSTAGRAM_BUSINESS_ID is not configured.');
        }

        $targetPermalink = $this->normalizePermalink($permalink);
        $after = null;

        do {
            $params = [
                'fields' => 'id,permalink',
                'limit' => 100,
            ];

            if ($after) {
                $params['after'] = $after;
            }

            $response = $this->graph()->get("{$instagramBusinessId}/media", $params)->throw()->json();

            foreach ($response['data'] ?? [] as $media) {
                if ($this->normalizePermalink($media['permalink'] ?? '') === $targetPermalink) {
                    return [
                        'instagram_media_id' => $media['id'],
                        'instagram_permalink' => $media['permalink'],
                    ];
                }
            }

            $after = $response['paging']['cursors']['after'] ?? null;
        } while ($after);

        throw new RuntimeException("Instagram media not found for permalink: {$permalink}");
    }

    private function instagramMediaMetrics(string $mediaId): array
    {
        $media = $this->graph()->get($mediaId, [
            'fields' => 'id,permalink,media_type,like_count,comments_count',
        ])->throw()->json();

        $insights = $this->graph()->get("{$mediaId}/insights", [
            'metric' => 'views',
        ])->throw()->json('data', []);

        $insightsByName = collect($insights)
            ->mapWithKeys(fn (array $insight) => [
                $insight['name'] => Arr::get($insight, 'values.0.value', 0),
            ]);

        return [
            'likes' => (int) ($media['like_count'] ?? 0),
            'comments' => (int) ($media['comments_count'] ?? 0),
            'views' => (int) $insightsByName->get('views', 0),
            'instagram_permalink' => $media['permalink'] ?? null,
        ];
    }

    private function graph(): PendingRequest
    {
        $token = config('services.meta.access_token');

        if (! $token) {
            throw new RuntimeException('META_ACCESS_TOKEN is not configured.');
        }

        return Http::baseUrl(sprintf(
            'https://graph.facebook.com/%s',
            config('services.meta.graph_version', 'v25.0')
        ))->withToken($token)->acceptJson();
    }

    private function normalizePermalink(string $permalink): string
    {
        $parts = parse_url(trim($permalink));
        $path = rtrim($parts['path'] ?? '', '/');

        return strtolower("https://www.instagram.com{$path}");
    }
}
