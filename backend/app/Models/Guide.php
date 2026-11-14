<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Guide extends Model
{
    protected $fillable = ['user_id', 'city', 'languages', 'rate', 'bio'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function circuits()
    {
        return $this->hasMany(Circuit::class);
    }

    public function reviews()
    {
        return $this->hasManyThrough(Review::class, Circuit::class);
    }
}