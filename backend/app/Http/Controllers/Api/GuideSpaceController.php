<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Circuit;
use App\Models\Guide;
use App\Models\Reservation;
use App\Models\Review;
use Illuminate\Http\Request;

class GuideSpaceController extends Controller
{
    // Vérifie que l'utilisateur est un guide et retourne son profil (ou null)
    private function guideOf(Request $request): ?Guide
    {
        abort_if($request->user()->role !== 'guide', 403, 'Espace réservé aux guides.');

        return $request->user()->guide;
    }

    public function showProfile(Request $request)
    {
        return response()->json($this->guideOf($request));
    }

    public function updateProfile(Request $request)
    {
        $this->guideOf($request);

        $data = $request->validate([
            'city' => 'required|string|max:100',
            'languages' => 'required|string|max:255',
            'rate' => 'required|numeric|min:0|max:99999',
            'bio' => 'nullable|string|max:1000',
        ]);

        $guide = Guide::updateOrCreate(
            ['user_id' => $request->user()->id],
            $data
        );

        return response()->json($guide);
    }

    public function destroyProfile(Request $request)
    {
        $guide = $this->guideOf($request);

        if (! $guide) {
            return response()->json(['message' => 'Aucun profil à supprimer.'], 404);
        }

        $circuitIds = $guide->circuits()->pluck('id');

        if (Reservation::whereIn('circuit_id', $circuitIds)->exists()) {
            return response()->json(
                ['message' => "Impossible de supprimer le profil : des réservations existent. Contactez l'administrateur."],
                422
            );
        }

        $guide->circuits()->delete();
        $guide->delete();

        return response()->json(['message' => 'Profil supprimé.']);
    }

    public function circuits(Request $request)
    {
        $guide = $this->guideOf($request);

        if (! $guide) {
            return response()->json([]);
        }

        return $guide->circuits()
            ->withCount('reservations')
            ->withAvg('reviews', 'rating')
            ->latest()
            ->get();
    }

    // Avis reçus sur les circuits du guide
    public function reviews(Request $request)
    {
        $guide = $this->guideOf($request);

        if (! $guide) {
            return response()->json([]);
        }

        return Review::whereIn('circuit_id', $guide->circuits()->pluck('id'))
            ->with(['user:id,name', 'circuit:id,title'])
            ->latest()
            ->get();
    }

    public function storeCircuit(Request $request)
    {
        $guide = $this->guideOf($request);

        if (! $guide) {
            return response()->json(['message' => "Complétez d'abord votre profil de guide."], 422);
        }

        $circuit = $guide->circuits()->create($this->validated($request));

        return response()->json($circuit, 201);
    }

    public function updateCircuit(Request $request, Circuit $circuit)
    {
        $guide = $this->guideOf($request);
        abort_if(! $guide || $circuit->guide_id !== $guide->id, 403, 'Ce circuit ne vous appartient pas.');

        $circuit->update($this->validated($request));

        return response()->json($circuit);
    }

    public function destroyCircuit(Request $request, Circuit $circuit)
    {
        $guide = $this->guideOf($request);
        abort_if(! $guide || $circuit->guide_id !== $guide->id, 403, 'Ce circuit ne vous appartient pas.');

        if ($circuit->reservations()->exists()) {
            return response()->json(
                ['message' => 'Impossible de supprimer : ce circuit a déjà des réservations.'],
                422
            );
        }

        $circuit->delete();

        return response()->json(['message' => 'Circuit supprimé.']);
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'title' => 'required|string|max:150',
            'description' => 'required|string|max:2000',
            'price' => 'required|numeric|min:0|max:99999',
            'duration' => 'required|string|max:50',
            'city' => 'required|string|max:100',
        ]);
    }
}