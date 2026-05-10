<?php

namespace App\Traits;

use App\Events\EntityUpdated;

trait BroadcastsRealTime
{
    public static function bootBroadcastsRealTime()
    {
        static::created(function ($model) {
            self::broadcastChange($model, 'created');
        });

        static::updated(function ($model) {
            self::broadcastChange($model, 'updated');
        });

        static::deleted(function ($model) {
            self::broadcastChange($model, 'deleted');
        });
    }

    protected static function broadcastChange($model, $action)
    {
        broadcast(new EntityUpdated($model->getTable(), $action, [
            'id' => $model->id
        ]))->toOthers();
    }
}
