<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Circuit;
use App\Models\Notification;
use App\Models\Reservation;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    // Avis d'un circuit (public)
    public function indexByCircuit(Circuit $circuit)
    {
        return $circuit->reviews()
            ->with('user:id,name')
            ->latest()
            ->get();
    }

    // IDs des réservations déjà notées par l'utilisateur connecté
    public function mine(Request $request)
    {
        return Review::where('user_id', $request->user()->id)
            ->pluck('reservation_id');
    }

    public function store(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'tourist') {
            return response()->json(['message' => 'Seuls les touristes peuvent donner un avis.'], 403);
        }

        $data = $request->validate([
            'reservation_id' => 'required|exists:reservations,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $reservation = Reservation::with('circuit.guide')->findOrFail($data['reservation_id']);

        if ($reservation->user_id !== $user->id) {
            return response()->json(['message' => 'Cette réservation ne vous appartient pas.'], 403);
        }

        if ($reservation->status !== 'confirmed') {
            return response()->json(['message' => 'Vous pouvez noter uniquement une réservation confirmée.'], 422);
        }

        if (Review::where('reservation_id', $reservation->id)->exists()) {
            return response()->json(['message' => 'Vous avez déjà donné un avis pour cette réservation.'], 422);
        }

        $review = Review::create([
            'user_id' => $user->id,
            'circuit_id' => $reservation->circuit_id,
            'reservation_id' => $reservation->id,
            'rating' => $data['rating'],
            'comment' => $data['comment'] ?? null,
        ]);

        Notification::create([
            'user_id' => $reservation->circuit->guide->user_id,
            'message' => "Nouvel avis ({$data['rating']}/5) sur « {$reservation->circuit->title} ».",
        ]);

        return response()->json($review, 201);
    }
}