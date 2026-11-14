<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Guide;
use Illuminate\Http\Request;

class GuideController extends Controller
{
    public function index(Request $request)
    {
        $query = Guide::with('user:id,name')
            ->withAvg('reviews', 'rating')
            ->withCount('reviews')
            ->whereHas('user', fn ($u) => $u->where('is_active', true));

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('city', 'like', "%{$search}%")
                    ->orWhere('bio', 'like', "%{$search}%")
                    ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$search}%"));
            });
        }

        if ($city = $request->query('city')) {
            $query->where('city', $city);
        }

        if ($language = $request->query('language')) {
            $query->where('languages', 'like', "%{$language}%");
        }

        if ($request->filled('max_rate')) {
            $query->where('rate', '<=', $request->query('max_rate'));
        }

        if ($request->filled('min_rating')) {
            $query->whereRaw(
                '(SELECT COALESCE(AVG(r.rating), 0) FROM reviews r JOIN circuits c ON c.id = r.circuit_id WHERE c.guide_id = guides.id) >= ?',
                [$request->query('min_rating')]
            );
        }

        return $query->orderBy('id')->paginate(6)->withQueryString();
    }

    public function show(Guide $guide)
    {
        $guide->load(['user:id,name', 'circuits'])
            ->loadAvg('reviews', 'rating')
            ->loadCount('reviews');

        return response()->json($guide);
    }

    public function cities()
    {
        return response()->json(
            Guide::select('city')->distinct()->orderBy('city')->pluck('city')
        );
    }
}