<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Circuit;
use App\Models\Notification;
use App\Models\Reservation;
use Illuminate\Http\Request;

class ReservationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Reservation::with([
            'circuit:id,title,price,guide_id',
            'user:id,name,email',
            'review:id,reservation_id,rating',
        ])->latest();

        if ($user->role === 'tourist') {
            $query->where('user_id', $user->id);
        } elseif ($user->role === 'guide') {
            $query->whereHas('circuit.guide', fn ($q) => $q->where('user_id', $user->id));
        }

        return $query->paginate(10);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        abort_unless($user->role === 'tourist', 403, 'Seuls les touristes peuvent réserver.');

        $data = $request->validate([
            'circuit_id' => 'required|exists:circuits,id',
            'date' => 'required|date|after_or_equal:today',
        ]);

        $reservation = Reservation::create([
            'user_id' => $user->id,
            'circuit_id' => $data['circuit_id'],
            'date' => $data['date'],
        ]);

        $circuit = Circuit::with('guide')->find($data['circuit_id']);

        if ($circuit->guide) {
            Notification::create([
                'user_id' => $circuit->guide->user_id,
                'message' => "Nouvelle réservation de {$user->name} pour \"{$circuit->title}\" le {$data['date']}.",
            ]);
        }

        return response()->json($reservation->load('circuit:id,title,price'), 201);
    }

    public function updateStatus(Request $request, Reservation $reservation)
    {
        $user = $request->user();
        $data = $request->validate(['status' => 'required|in:confirmed,refused']);

        $reservation->load('circuit.guide');

        $isOwnerGuide = $user->role === 'guide'
            && $reservation->circuit->guide
            && $reservation->circuit->guide->user_id === $user->id;

        abort_unless($isOwnerGuide || $user->role === 'admin', 403, 'Action non autorisée.');
        abort_unless($reservation->status === 'pending', 422, 'Cette réservation a déjà été traitée.');

        $reservation->update(['status' => $data['status']]);

        $label = $data['status'] === 'confirmed' ? 'confirmée' : 'refusée';

        Notification::create([
            'user_id' => $reservation->user_id,
            'message' => "Votre réservation \"{$reservation->circuit->title}\" du {$reservation->date->format('Y-m-d')} est {$label}.",
        ]);

        return response()->json($reservation);
    }

    public function cancel(Request $request, Reservation $reservation)
    {
        $user = $request->user();

        abort_unless($reservation->user_id === $user->id, 403, 'Action non autorisée.');
        abort_unless(in_array($reservation->status, ['pending', 'confirmed']), 422, 'Cette réservation ne peut plus être annulée.');

        $reservation->update(['status' => 'cancelled']);
        $reservation->load('circuit.guide');

        if ($reservation->circuit->guide) {
            Notification::create([
                'user_id' => $reservation->circuit->guide->user_id,
                'message' => "{$user->name} a annulé la réservation \"{$reservation->circuit->title}\" du {$reservation->date->format('Y-m-d')}.",
            ]);
        }

        return response()->json($reservation);
    }
}