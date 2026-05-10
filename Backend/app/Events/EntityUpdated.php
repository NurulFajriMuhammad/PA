<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class EntityUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $table;
    public $action;
    public $data;

    /**
     * Create a new event instance.
     */
    public function __construct($table, $action, $data = null)
    {
        $this->table = $table;
        $this->action = $action;
        $this->data = $data;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        // Gunakan channel publik untuk kemudahan sinkronisasi data umum
        return [
            new Channel('public-data-updates'),
        ];
    }

    public function broadcastAs()
    {
        return 'entity.updated';
    }
}
