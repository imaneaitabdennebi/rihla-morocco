<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;

class HomeController extends Controller
{
    // Derniers avis avec commentaire (affichés sur la page d'accueil)
    public function latestReviews()
    {
        return Review::with(['user:id,name', 'circuit:id,title'])
            ->whereNotNull('comment')
            ->where('comment', '!=', '')
            ->latest()
            ->limit(3)
            ->get()
            ->map(fn ($r) => [
                'id' => $r->id,
                'rating' => $r->rating,
                'comment' => $r->comment,
                'author' => $r->user?->name,
                'circuit' => $r->circuit?->title,
            ]);
    }
}