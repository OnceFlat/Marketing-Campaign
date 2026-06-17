<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use App\Services\MetaCampaignMetricsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Throwable;

class CampaignController extends Controller
{
    public function index(Request $request, MetaCampaignMetricsService $metaMetrics): JsonResponse
    {
        $campaigns = Campaign::with('user:id,name,email')
            ->withCount('aktivitas')
            ->when($request->query('status'), fn ($query, $status) => $query->where('status', $status))
            ->when($request->query('search'), function ($query, $search) {
                $query->where(function ($inner) use ($search) {
                    $inner->where('name', 'like', "%{$search}%")
                        ->orWhere('channel', 'like', "%{$search}%")
                        ->orWhere('objective', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate($request->integer('per_page', 10));

        $campaigns->setCollection(
            $campaigns->getCollection()->map(
                fn (Campaign $campaign) => $this->syncMetaMetricsIfConfigured($campaign, $metaMetrics)
                    ->load('user:id,name,email')
                    ->loadCount('aktivitas')
            )
        );

        return response()->json($campaigns);
    }

    public function store(Request $request, MetaCampaignMetricsService $metaMetrics): JsonResponse
    {
        $campaign = Campaign::create($this->validated($request));
        $campaign = $this->syncMetaMetricsIfConfigured($campaign, $metaMetrics);

        return response()->json($campaign->load('user:id,name,email')->loadCount('aktivitas'), 201);
    }

    public function show(Campaign $campaign, MetaCampaignMetricsService $metaMetrics): JsonResponse
    {
        $campaign = $this->syncMetaMetricsIfConfigured($campaign, $metaMetrics);

        return response()->json(
            $campaign->load(['user:id,name,email', 'aktivitas.user:id,name,email'])->loadCount('aktivitas')
        );
    }

    public function update(Request $request, Campaign $campaign, MetaCampaignMetricsService $metaMetrics): JsonResponse
    {
        $campaign->update($this->validated($request));
        $campaign = $this->syncMetaMetricsIfConfigured($campaign, $metaMetrics);

        return response()->json($campaign->load('user:id,name,email')->loadCount('aktivitas'));
    }

    public function destroy(Campaign $campaign): JsonResponse
    {
        $campaign->delete();

        return response()->json(['message' => 'Campaign berhasil dihapus.']);
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'user_id' => ['nullable', 'exists:users,id'],
            'name' => ['required', 'string', 'max:255'],
            'objective' => ['nullable', 'string'],
            'channel' => ['required', 'string', 'max:100'],
            'budget' => ['required', 'numeric', 'min:0'],
            'views' => ['nullable', 'integer', 'min:0'],
            'likes' => ['nullable', 'integer', 'min:0'],
            'comments' => ['nullable', 'integer', 'min:0'],
            'shares' => ['nullable', 'integer', 'min:0'],
            'instagram_media_id' => ['nullable', 'string', 'max:255'],
            'instagram_permalink' => ['nullable', 'url', 'max:255'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'status' => ['required', Rule::in(['active', 'posted', 'cancelled'])],
        ]);
    }

    private function syncMetaMetricsIfConfigured(Campaign $campaign, MetaCampaignMetricsService $metaMetrics): Campaign
    {
        if (! $campaign->instagram_permalink && ! $campaign->instagram_media_id) {
            return $campaign;
        }

        try {
            return $metaMetrics->sync($campaign);
        } catch (Throwable $exception) {
            Log::warning('Campaign Meta metrics sync failed.', [
                'campaign_id' => $campaign->id,
                'message' => $exception->getMessage(),
            ]);

            return $campaign;
        }
    }
}
