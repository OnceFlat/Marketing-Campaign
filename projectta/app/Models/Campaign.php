<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'user_id',
    'name',
    'objective',
    'channel',
    'budget',
    'views',
    'likes',
    'comments',
    'shares',
    'instagram_media_id',
    'instagram_permalink',
    'start_date',
    'end_date',
    'status',
])]
class Campaign extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'budget' => 'decimal:2',
            'views' => 'integer',
            'likes' => 'integer',
            'comments' => 'integer',
            'shares' => 'integer',
            'start_date' => 'date',
            'end_date' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function aktivitas(): HasMany
    {
        return $this->hasMany(Aktivitas::class);
    }
}
