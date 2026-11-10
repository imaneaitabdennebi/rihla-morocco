<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Circuit extends Model
{
    protected $fillable = ['guide_id', 'title', 'description', 'price', 'duration', 'city'];

    public function guide()
    {
        return $this->belongsTo(Guide::class);
    }

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
}