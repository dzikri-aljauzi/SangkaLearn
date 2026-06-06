<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserGroup extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'description',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean'
    ];

    public function users()
    {
        return $this->hasMany(User::class, 'user_group_id');
    }

    public function specialStudents()
    {
        return $this->hasMany(User::class, 'user_group_id')
                   ->whereHas('roles', function($query) {
                       $query->where('name', 'student');
                   })
                   ->where('user_type', 'special');
    }

    public function subAdmins()
    {
        return $this->hasMany(User::class, 'user_group_id')
                   ->whereHas('roles', function($query) {
                       $query->where('name', 'sub_admin');
                   });
    }

    public function assignedCourses()
    {
        return $this->belongsToMany(Course::class, 'user_group_courses')
                   ->withPivot(['assigned_at', 'expires_at'])
                   ->withTimestamps();
    }
}