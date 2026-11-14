<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    protected $fillable = ['user_id', 'circuit_id', 'date', 'status'];

    protected function casts(): array
    {
        return [
            'date' => 'date',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function circuit()
    {
        return $this->belongsTo(Circuit::class);
    }

    public function review()
    {
        return $this->hasOne(Review::class);
    }
}