<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Aktivitas;
use App\Models\Campaign;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $campaigns = Campaign::with('user:id,name,email')
            ->withCount('aktivitas')
            ->latest()
            ->limit(100)
            ->get();

        $campaignTrend = $campaigns
            ->sortBy(fn (Campaign $campaign) => $campaign->start_date ?? $campaign->created_at)
            ->groupBy(fn (Campaign $campaign) => ($campaign->start_date ?? $campaign->created_at)->format('M Y'))
            ->map(fn ($items, $label) => [
                'label' => $label,
                'total' => $items->sum('views'),
            ])
            ->values()
            ->take(-6)
            ->values();

        return response()->json([
            'totals' => [
                'campaigns' => Campaign::count(),
                'active_campaigns' => Campaign::where('status', 'active')->count(),
                'aktivitas' => Aktivitas::count(),
                'users' => User::count(),
            ],
            'engagement_totals' => [
                'views' => Campaign::sum('views'),
                'likes' => Campaign::sum('likes'),
                'comments' => Campaign::sum('comments'),
                'shares' => Campaign::sum('shares'),
            ],
            'campaigns_by_status' => Campaign::query()
                ->selectRaw('status, COUNT(*) as total')
                ->groupBy('status')
                ->pluck('total', 'status'),
            'campaign_trend' => $campaignTrend,
            'recent_campaigns' => $campaigns->take(5)->values(),
            'report_campaigns' => $campaigns,
            'upcoming_aktivitas' => Aktivitas::with(['campaign:id,name,status', 'user:id,name,email'])
                ->whereDate('activity_date', '>=', now()->toDateString())
                ->orderBy('activity_date')
                ->limit(5)
                ->get(),
        ]);
    }
}
