<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\Consulting;

Broadcast::channel('consulting.{id}', function ($user, $id) {
    if (!$user) return false;

    $consulting = Consulting::find($id);
    if (!$consulting) return false;

    if (!$user->roles || $user->roles->isEmpty()) return false;

    return $user->roles->first()->id === $consulting->role_id;
});
