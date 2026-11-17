<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Circuit;
use App\Models\Guide;
use App\Models\Reservation;
use App\Models\Review;
use App\Models\User;
use Illuminate\Http\Request;

class StatsController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        return match ($user->role) {
            'admin' => response()->json($this->forAdmin()),
            'guide' => response()->json($this->forGuide($user)),
            default => abort(403, "Statistiques réservées aux guides et à l'administrateur."),
        };
    }

    private function statuses($query): array
    {
        $counts = $query->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status')
            ->all();

        return array_merge(
            ['pending' => 0, 'confirmed' => 0, 'refused' => 0, 'cancelled' => 0],
            $counts
        );
    }

    // Somme des prix des réservations confirmées (optionnel : seulement certains circuits)
    private function revenue($circuitIds = null): float
    {
        $query = Reservation::query()
            ->join('circuits', 'circuits.id', '=', 'reservations.circuit_id')
            ->where('reservations.status', 'confirmed');

        if ($circuitIds !== null) {
            $query->whereIn('reservations.circuit_id', $circuitIds);
        }

        return (float) $query->sum('circuits.price');
    }

    private function forAdmin(): array
    {
        $avg = Review::avg('rating');

        $topGuides = Guide::with('user:id,name')
            ->withAvg('reviews', 'rating')
            ->withCount('reviews')
            ->has('reviews')
            ->orderByDesc('reviews_avg_rating')
            ->orderByDesc('reviews_count')
            ->limit(5)
            ->get()
            ->map(fn ($g) => [
                'id' => $g->id,
                'name' => $g->user?->name,
                'city' => $g->city,
                'rating' => round((float) $g->reviews_avg_rating, 1),
                'reviews_count' => $g->reviews_count,
            ]);

        $topCircuits = Circuit::withCount('reservations')
            ->withAvg('reviews', 'rating')
            ->orderByDesc('reservations_count')
            ->limit(5)
            ->get()
            ->map(fn ($c) => [
                'id' => $c->id,
                'title' => $c->title,
                'city' => $c->city,
                'reservations_count' => $c->reservations_count,
                'rating' => $c->reviews_avg_rating ? round((float) $c->reviews_avg_rating, 1) : null,
            ]);

        return [
            'role' => 'admin',
            'users' => User::count(),
            'tourists' => User::where('role', 'tourist')->count(),
            'guides' => User::where('role', 'guide')->count(),
            'circuits' => Circuit::count(),
            'reservations' => Reservation::count(),
            'reservations_by_status' => $this->statuses(Reservation::query()),
            'reviews' => Review::count(),
            'average_rating' => $avg ? round((float) $avg, 1) : null,
            'revenue' => $this->revenue(),
            'top_guides' => $topGuides,
            'top_circuits' => $topCircuits,
        ];
    }

    private function forGuide(User $user): array
    {
        $guide = $user->guide;

        if (! $guide) {
            return [
                'role' => 'guide',
                'circuits' => 0,
                'reservations' => 0,
                'reservations_by_status' => ['pending' => 0, 'confirmed' => 0, 'refused' => 0, 'cancelled' => 0],
                'reviews' => 0,
                'average_rating' => null,
                'revenue' => 0,
                'top_circuits' => [],
            ];
        }

        $ids = $guide->circuits()->pluck('id');
        $avg = Review::whereIn('circuit_id', $ids)->avg('rating');

        $topCircuits = $guide->circuits()
            ->withCount('reservations')
            ->withAvg('reviews', 'rating')
            ->orderByDesc('reservations_count')
            ->limit(5)
            ->get()
            ->map(fn ($c) => [
                'id' => $c->id,
                'title' => $c->title,
                'city' => $c->city,
                'reservations_count' => $c->reservations_count,
                'rating' => $c->reviews_avg_rating ? round((float) $c->reviews_avg_rating, 1) : null,
            ]);

        return [
            'role' => 'guide',
            'circuits' => $ids->count(),
            'reservations' => Reservation::whereIn('circuit_id', $ids)->count(),
            'reservations_by_status' => $this->statuses(Reservation::whereIn('circuit_id', $ids)),
            'reviews' => Review::whereIn('circuit_id', $ids)->count(),
            'average_rating' => $avg ? round((float) $avg, 1) : null,
            'revenue' => $this->revenue($ids),
            'top_circuits' => $topCircuits,
        ];
    }
}