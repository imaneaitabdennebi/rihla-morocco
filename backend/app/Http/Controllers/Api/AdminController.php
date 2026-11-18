<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Circuit;
use App\Models\Review;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    private function ensureAdmin(Request $request): void
    {
        abort_if($request->user()->role !== 'admin', 403, "Espace réservé à l'administrateur.");
    }

    // ---------- Utilisateurs ----------
    public function users(Request $request)
    {
        $this->ensureAdmin($request);

        return User::query()
            ->select('id', 'name', 'email', 'role', 'is_active', 'created_at')
            ->when($request->filled('search'), function ($q) use ($request) {
                $term = '%' . $request->search . '%';
                $q->where(fn ($w) => $w->where('name', 'like', $term)->orWhere('email', 'like', $term));
            })
            ->when($request->filled('role'), fn ($q) => $q->where('role', $request->role))
            ->latest()
            ->paginate(10)
            ->withQueryString();
    }

    public function toggleUser(Request $request, User $user)
    {
        $this->ensureAdmin($request);

        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Vous ne pouvez pas désactiver votre propre compte.'], 422);
        }

        $user->is_active = ! $user->is_active;
        $user->save();

        // Si désactivé : on déconnecte l'utilisateur partout
        if (! $user->is_active) {
            $user->tokens()->delete();
        }

        return response()->json(['id' => $user->id, 'is_active' => $user->is_active]);
    }

    public function destroyUser(Request $request, User $user)
    {
        $this->ensureAdmin($request);

        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Vous ne pouvez pas supprimer votre propre compte.'], 422);
        }

        try {
            $user->tokens()->delete();
            $user->delete();
        } catch (QueryException $e) {
            return response()->json(
                ['message' => 'Suppression impossible : cet utilisateur a des données liées. Désactivez-le plutôt.'],
                422
            );
        }

        return response()->json(['message' => 'Utilisateur supprimé.']);
    }

    // ---------- Circuits ----------
    public function circuits(Request $request)
    {
        $this->ensureAdmin($request);

        return Circuit::with('guide.user:id,name')
            ->withCount('reservations')
            ->when($request->filled('search'), fn ($q) => $q->where('title', 'like', '%' . $request->search . '%'))
            ->latest()
            ->paginate(10)
            ->withQueryString();
    }

    public function updateCircuit(Request $request, Circuit $circuit)
    {
        $this->ensureAdmin($request);

        $data = $request->validate([
            'title' => 'required|string|max:150',
            'description' => 'required|string|max:2000',
            'price' => 'required|numeric|min:0|max:99999',
            'duration' => 'required|string|max:50',
            'city' => 'required|string|max:100',
        ]);

        $circuit->update($data);

        return response()->json($circuit);
    }

    public function destroyCircuit(Request $request, Circuit $circuit)
    {
        $this->ensureAdmin($request);

        if ($circuit->reservations()->exists()) {
            return response()->json(
                ['message' => 'Impossible de supprimer : ce circuit a déjà des réservations.'],
                422
            );
        }

        $circuit->delete();

        return response()->json(['message' => 'Circuit supprimé.']);
    }

    // ---------- Avis ----------
    public function reviews(Request $request)
    {
        $this->ensureAdmin($request);

        return Review::with(['user:id,name', 'circuit:id,title'])
            ->latest()
            ->paginate(10);
    }

    public function destroyReview(Request $request, Review $review)
    {
        $this->ensureAdmin($request);

        $review->delete();

        return response()->json(['message' => 'Avis supprimé.']);
    }
}