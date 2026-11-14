<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Circuit;
use Illuminate\Http\Request;

class CircuitController extends Controller
{
    public function index(Request $request)
    {
        $query = Circuit::with('guide.user:id,name')
            ->withAvg('reviews', 'rating')
            ->withCount('reviews');

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%");
            });
        }

        if ($city = $request->query('city')) {
            $query->where('city', $city);
        }

        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->query('max_price'));
        }

        if ($request->filled('min_rating')) {
            $query->whereRaw(
                '(SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE reviews.circuit_id = circuits.id) >= ?',
                [$request->query('min_rating')]
            );
        }

        return $query->orderBy('id')->paginate(6)->withQueryString();
    }

    public function show(Circuit $circuit)
    {
        $circuit->load(['guide.user:id,name', 'reviews.user:id,name'])
            ->loadAvg('reviews', 'rating')
            ->loadCount('reviews');

        return response()->json($circuit);
    }
}