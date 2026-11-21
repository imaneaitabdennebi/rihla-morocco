<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use Illuminate\Http\Request;

class ExportController extends Controller
{
    // Réservations visibles par l'utilisateur (sans pagination), pour l'export PDF/Excel
    public function reservations(Request $request)
    {
        $user = $request->user();

        abort_if($user->role === 'tourist', 403, "Export réservé aux guides et à l'administrateur.");

        $query = Reservation::with([
            'user:id,name,email',
            'circuit:id,title,city,price,guide_id',
        ])->latest('date');

        if ($user->role === 'guide') {
            $guideId = $user->guide?->id;
            $query->whereHas('circuit', fn ($q) => $q->where('guide_id', $guideId));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return $query->get()->map(fn ($r) => [
            'id' => $r->id,
            'date' => $r->date->format('Y-m-d'),
            'circuit' => $r->circuit?->title,
            'city' => $r->circuit?->city,
            'price' => (float) $r->circuit?->price,
            'tourist' => $r->user?->name,
            'email' => $r->user?->email,
            'status' => $r->status,
        ]);
    }
}