<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CircuitController;
use App\Http\Controllers\Api\ExportController;
use App\Http\Controllers\Api\GuideController;
use App\Http\Controllers\Api\GuideSpaceController;
use App\Http\Controllers\Api\HomeController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\StatsController;
use Illuminate\Support\Facades\Route;

// Routes publiques
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/cities', [GuideController::class, 'cities']);
Route::get('/guides', [GuideController::class, 'index']);
Route::get('/guides/{guide}', [GuideController::class, 'show']);
Route::get('/circuits', [CircuitController::class, 'index']);
Route::get('/circuits/{circuit}', [CircuitController::class, 'show']);
Route::get('/circuits/{circuit}/reviews', [ReviewController::class, 'indexByCircuit']);
Route::get('/reviews/latest', [HomeController::class, 'latestReviews']);

// Routes protégées
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Réservations
    Route::get('/reservations', [ReservationController::class, 'index']);
    Route::post('/reservations', [ReservationController::class, 'store']);
    Route::patch('/reservations/{reservation}/status', [ReservationController::class, 'updateStatus']);
    Route::patch('/reservations/{reservation}/cancel', [ReservationController::class, 'cancel']);

    // Export
    Route::get('/export/reservations', [ExportController::class, 'reservations']);

    // Avis
    Route::get('/reviews/mine', [ReviewController::class, 'mine']);
    Route::post('/reviews', [ReviewController::class, 'store']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::patch('/notifications/read-all', [NotificationController::class, 'markAllRead']);
    Route::patch('/notifications/{notification}/read', [NotificationController::class, 'markRead']);

    // Statistiques (guide + admin)
    Route::get('/stats', [StatsController::class, 'index']);

    // Espace guide
    Route::get('/guide/profile', [GuideSpaceController::class, 'showProfile']);
    Route::put('/guide/profile', [GuideSpaceController::class, 'updateProfile']);
    Route::delete('/guide/profile', [GuideSpaceController::class, 'destroyProfile']);
    Route::get('/guide/reviews', [GuideSpaceController::class, 'reviews']);
    Route::get('/guide/circuits', [GuideSpaceController::class, 'circuits']);
    Route::post('/guide/circuits', [GuideSpaceController::class, 'storeCircuit']);
    Route::put('/guide/circuits/{circuit}', [GuideSpaceController::class, 'updateCircuit']);
    Route::delete('/guide/circuits/{circuit}', [GuideSpaceController::class, 'destroyCircuit']);

    // Espace admin
    Route::get('/admin/users', [AdminController::class, 'users']);
    Route::patch('/admin/users/{user}/toggle', [AdminController::class, 'toggleUser']);
    Route::delete('/admin/users/{user}', [AdminController::class, 'destroyUser']);
    Route::get('/admin/circuits', [AdminController::class, 'circuits']);
    Route::put('/admin/circuits/{circuit}', [AdminController::class, 'updateCircuit']);
    Route::delete('/admin/circuits/{circuit}', [AdminController::class, 'destroyCircuit']);
    Route::get('/admin/reviews', [AdminController::class, 'reviews']);
    Route::delete('/admin/reviews/{review}', [AdminController::class, 'destroyReview']);
});