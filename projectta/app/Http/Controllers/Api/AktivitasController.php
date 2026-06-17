<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Aktivitas;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AktivitasController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $aktivitas = Aktivitas::with(['campaign:id,name,status', 'user:id,name,email'])
            ->when($request->query('campaign_id'), fn ($query, $campaignId) => $query->where('campaign_id', $campaignId))
            ->when($request->query('status'), fn ($query, $status) => $query->where('status', $status))
            ->when($request->query('search'), function ($query, $search) {
                $query->where(function ($inner) use ($search) {
                    $inner->where('title', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->orderByDesc('activity_date')
            ->paginate($request->integer('per_page', 10));

        return response()->json($aktivitas);
    }

    public function store(Request $request): JsonResponse
    {
        $aktivitas = Aktivitas::create($this->validated($request));

        return response()->json($aktivitas->load(['campaign:id,name,status', 'user:id,name,email']), 201);
    }

    public function show(Aktivitas $aktivita): JsonResponse
    {
        return response()->json($aktivita->load(['campaign:id,name,status', 'user:id,name,email']));
    }

    public function update(Request $request, Aktivitas $aktivita): JsonResponse
    {
        $aktivita->update($this->validated($request));

        return response()->json($aktivita->load(['campaign:id,name,status', 'user:id,name,email']));
    }

    public function destroy(Aktivitas $aktivita): JsonResponse
    {
        $aktivita->delete();

        return response()->json(['message' => 'Aktivitas berhasil dihapus.']);
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'campaign_id' => ['required', 'exists:campaigns,id'],
            'user_id' => ['nullable', 'exists:users,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'activity_date' => ['required', 'date'],
            'status' => ['required', Rule::in(['planned', 'in_progress', 'done', 'cancelled'])],
        ]);
    }
}
